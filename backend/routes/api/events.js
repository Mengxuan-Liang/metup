const express = require('express');
const router = express.Router();

const { Event, Group, Attendance, EventImage, Membership, GroupImage, User, Venue } = require('../../db/models');
const { where, Op } = require('sequelize');
const { sequelize } = require('../../db/models');

const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const moment = require('moment');

// // Get all Events
// router.get('/', async (req, res) => {
//     const events = await Event.findAll({
//         include: [{
//             model: Group,
//             attributes: ['id', 'name', 'city', 'state']
//         },
//         {
//             model: Venue,
//             attributes: ['id', 'city', 'state']
//         },
//         {
//             model: Attendance,
//             attributes: []
//         },
//         {
//             model: EventImage,
//             as: 'previewImage',
//             attributes: ['url'],
//             where: {
//                 preview: true
//             },
//             required: false
//         }],
//         attributes: {
//             exclude: ['createdAt', 'updatedAt'],
//             include: [
//                 [sequelize.fn('COUNT', sequelize.col('Attendances.eventId')), 'numAttending']
//             ]
//         },
//         group: ['Event.id', 'previewImage.eventId']
//     });
//     const formattedEvents = events.map(event => {
//         const eventData = event.toJSON();
//         return {
//             id: eventData.id,
//             venueId: eventData.venueId,
//             groupId: eventData.groupId,
//             name: eventData.name,
//             description: eventData.description,
//             type: eventData.type,
//             capacity: eventData.capacity,
//             price: eventData.price,
//             startDate: eventData.startDate,
//             endDate: eventData.endDate,
//             numAttending: eventData.numAttending,
//             previewImage: eventData.previewImage.length ? eventData.previewImage[0].url : null,
//             Group: eventData.Group,
//             Venue: eventData.Venue
//         }
//     })
//     res.json({
//         "Events": formattedEvents
//     })
// });

// GET ALL EVENTS: Add Query Filters to Get All Events

//utility function to validate date:the startDate parameter, if provided, should be in a string format. 
//This string should represent a date, which will then be parsed and validated here.
const isValidDate = (dateString) => {
    return !isNaN(Date.parse(dateString));//The Date.parse() method parses a date string and returns the number of milliseconds since the Unix Epoch.If the dateString is invalid, Date.parse() returns NaN (Not-a-Number).
}
router.get('/', async (req, res) => {
    // query
    let { page, size, name, type, startDate } = req.query;
    page = parseInt(page) || 1;
    size = parseInt(size) || 20;

    // validate query parameters
    const error = {};
    if (page < 1 || page > 10) error.page = "Page must be between 1 and 10";
    if (size < 1 || size > 20) error.size = "Size must be between 1 and 20";
    if (name && typeof name !== 'string') error.name = "Name must be a string";
    if (type && !['Online', 'In person'].includes(type)) error.type = "Type must be 'Online' or 'In person'";
    if (startDate && !isValidDate(startDate)) error.startDate = "Start date must be a valid datatime";

    if (Object.keys(error).length > 0) {
        return res.status(400).json({
            message: 'Bad Request',
            errors: error
        });
    }
    /*
    Dynamic Filtering:
    By constructing the filters object dynamically,can easily add only the conditions that are specified in the query parameters. This approach allows for flexible filtering based on the provided input.
    Optimized Queries:
    Using Sequelize operators like Op.like and Op.gte allows for more efficient and targeted database queries. This can improve performance compared to fetching all records and then filtering them in memory.
    */
    const filters = {};
    if (name) filters.name = { [Op.like]: `%${name}%` };//the Sequelize Op.like operator to perform a case-insensitive search for events with names that contain the specified name string. The % symbols are wildcards that match any sequence of characters.
    if (type) filters.type = type;
    if (startDate) filters.startDate = { [Op.gte]: new Date(startDate) };//the Sequelize Op.gte (greater than or equal to) operator to match events that start on or after the specified startDate.Can also use Op.eq to filter for events that start exactly on the specified date.

    // set limit and offset
    let limit = size;
    let offset = (page - 1) * limit;

    /*
    why we need this subquery to handle pagination before grouping them together in main query: 
    SQL Execution Order:
    FROM/JOIN: Tables are joined to form the base dataset.
    WHERE: Filtering conditions are applied to this base dataset.
    GROUP BY: The dataset is grouped based on the specified columns.
    HAVING: Filtering conditions are applied to the grouped data.
    SELECT: Columns are selected, and aggregate functions are calculated.
    ORDER BY: The result set is ordered.
    LIMIT/OFFSET: Finally, the limit and offset are applied to the result set.
    When LIMIT and OFFSET are combined with GROUP BY, the database groups the rows first and then applies the pagination to the grouped result(After grouping, SQL then applies the LIMIT and OFFSET clauses to the grouped result.limit = 5, the 5 will become 5 groups not 5 items if grouping first then pagination),
    This can cause several issues:
    Incorrect Offsets:
    The rows are grouped into aggregated results.
    When pagination is applied to these grouped results, the OFFSET may skip rows that should be included in the current page, or it may include rows that should be in other pages.
    This leads to incorrect data being fetched, as the OFFSET might not align with the actual number of groups.
    Complex Aggregations:
    Grouping often involves complex aggregations, and applying pagination after these aggregations can lead to unexpected behavior.
    For example, the count of rows per group (numAttending in this case) might be miscalculated if the pagination splits the groups across pages.
    Solution: Separate Pagination and Grouping
    To avoid the issues with combining pagination and grouping directly, you can separate these concerns by using a two-step query process:
     */
    // Step 1: Subquery for Pagination:
    const subquery = await Event.findAll({
        where: filters,
        limit: limit,
        offset: offset,
        attributes: ['id'],//the subquery's primary goal is to identify which event IDs match the filter criteria and fit within the specified pagination limits，this specifies that only the id column should be retrieved from the Event table.
        raw: true//This ensures the results are returned as plain JavaScript objects rather than Sequelize instances.
    });
    // console.log('**********',subquery) //[ { id: 1 }, { id: 2 } ]
    const eventIds = subquery.map(event => event.id);

    // Step 2: Main Query with Grouping:
    const events = await Event.findAll({
        where: { id: { [Op.in]: eventIds } }, // pagination
        include: [{
            model: Group,
            attributes: ['id', 'name', 'city', 'state']
        },
        {
            model: Venue,
            attributes: ['id', 'city', 'state']
        },
        {
            model: Attendance,
            attributes: []
        },
        {
            model: EventImage,
            as: 'previewImage',
            attributes: ['url','id','eventId'],
            where: {
                preview: true
            },
            required: false
        }],
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
            include: [
                [sequelize.fn('COUNT', sequelize.col('Attendances.eventId')), 'numAttending']
            ]
        },
        group: ['Event.id', 'previewImage.eventId','previewImage.id','Group.id','Venue.id'],
    });
    const formattedEvents = events.map(event => {
        const eventData = event.toJSON();
        return {
            id: eventData.id,
            venueId: eventData.venueId,
            groupId: eventData.groupId,
            name: eventData.name,
            description: eventData.description,
            type: eventData.type,
            capacity: eventData.capacity,
            price: eventData.price,
            startDate: eventData.startDate,
            endDate: eventData.endDate,
            numAttending: eventData.numAttending,
            previewImage: eventData.previewImage.length ? eventData.previewImage[0].url : null,
            Group: eventData.Group,
            Venue: eventData.Venue
        }
    })
    res.json({
        "Events": formattedEvents
    })
});

// Get details of an Event specified by its id
router.get('/:eventId', async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    if(!eventId){
        return res.status(400).json({ message: "Invalid event id" })
    }
    const event = await Event.findAll({
        where: { id: eventId },
        include: [
            {
                model: Group,
                attributes: ['id', 'name', 'private', 'city', 'state']
            },
            {
                model: Venue,
                attributes: ['id', 'address', 'city', 'state', 'lat', 'lng']
            },
            {
                model: EventImage,
                attributes: ['id', 'url', 'preview']
            }
        ]
    });
    if (event.length > 0 && eventId !== null) {
        res.json(event)
    } else {
        res.status(404).json({ message: 'Event could not be found' })
    }
});

// Add an Image to an Event based on the Event's id
// Middleware to validate image inputs
const validateImage = [
    check('url')
        .isURL()
        .withMessage('URL must be a valid URL'),
    check('preview')
        .isBoolean()
        .withMessage('Preview must be a boolean'),
];
router.post('/:eventId/images', requireAuth, validateImage, async (req, res) => {
    //Require proper authorization: Current User must be an attendee, host, or co-host of the event
    const eventId = parseInt(req.params.eventId);
    if(!eventId){
        return res.status(400).json({ message: "Invalid event id" })
    }
    const currentUser = req.user.id;
    const attendance = await Attendance.findOne({
        where: { 
            eventId: eventId,
            userId: currentUser
        }
    });
    if(!attendance){
        res.status(404).json({message: 'No attendance between the user and this event'})
    };
    const event = await Event.findByPk(eventId);
    if(!event){
        res.status(404).json({message: 'No event'})
    };
    const group = await Group.findByPk(event.groupId);
    if(!group){
        res.status(404).json({message: 'No group'})
    };
    const organizer = group.organizerId;
    const membership = await Membership.findOne({
        where: {
            userId: currentUser,
            groupId: group.id
        }
    });
    if(!membership){
        res.status(404).json({message: 'No membership'})
    };
    if(attendance.status === 'attending' || currentUser === organizer || membership.status === 'co-host'){
        const { url, preview } = req.body;
            const newEventImg = await EventImage.create({
                eventId: eventId,
                url,
                preview
            });
            res.json(newEventImg)
    }else {
        res.status(403).json({ message: 'Not allowed' })
    }
    // const attendanceData = attendance.some(attend => {
    //     const attednData = attend.toJSON();
    //     return attednData.userId === currentUser
    // })
    // if (attendanceData) {
    //     const event = await Event.findByPk(eventId);
    //     if (event.id !== null) {
    //         const { url, preview } = req.body;
    //         const newEventImg = await EventImage.create({
    //             eventId: eventId,
    //             url,
    //             preview
    //         });
    //         res.json(newEventImg)
    //     } else {
    //         res.status(404).json({ message: 'Event could not be found' })
    //     }
    // } else {
    //     res.status(403).json({ message: 'Not allowed' })
    // }
})

// Edit an Event specified by its id
const validateUpdateEvent = [
    check('name')
        .optional()//The optional() method in the validation middleware ensures that the fields are only validated if they are present in the request body.
        .isLength({ min: 5 })
        .withMessage('Name must be 60 characters or less'),
    check('type')
        .optional()
        .isIn(['Online', 'In person'])
        .withMessage("Type must be 'Online' or 'In person'"),
    check('capacity')
        .optional()
        .isInt()
        .withMessage("Capacity must be an integer"),
    check('price')
        .optional()
        .isNumeric()
        .custom(value => {
            if (value < 0) {
                throw Error('Price must be a positive number')
            }
            return true;
        })
        .toFloat({min:0})
        .withMessage("Price is invalid"),
    check('description')
        .optional()
        .exists({ checkFalsy: true })
        .withMessage('Description is required'),
    check('startDate')
        .optional()
        .custom((value, { req }) => {
            const startDate = moment(req.body.startDate);//Parse startDate from req.body
            // Checking the format of a data: if (!moment(value, 'YYYY-MM-DD', true).isValid()) { throw new Error('Invalid start date format. Must be in YYYY-MM-DD format.');}
            if (!startDate.isValid()) {
                throw Error('Invalid start date')
            }
            if (!moment(value).isAfter()) {// or if(!startDate.isAfter())
                throw Error('Start date must be in the future')
            }
            return true;
        })
        .toDate()//convert a date object or a date-like string into a JavaScript Date object explicitly.
        .withMessage('Start date must be in the future'),
    check('endDate')
        .optional()
        .custom((value, { req }) => {//{ req } is used to access req.body.startDate. This allows to compare startDate with endDate directly during validation.
            const startDate = moment(req.body.startDate);
            const endDate = moment(req.body.endDate);
            if (!endDate.isValid()) {
                throw Error('Invalid end date')
            }
            if (!startDate.isValid()) {
                throw Error('Invalid start date')
            }
            if (!endDate.isAfter(startDate)) {
                throw Error('Start date must be in the future')
            }
            return true;
        })
        .toDate()
        .withMessage('End date is less than start date'),
    handleValidationErrors
];
router.put('/:eventId', requireAuth, validateUpdateEvent, async (req, res) => {
    //Require Authorization: Current User must be the organizer of the group 
    //or a member of the group with a status of "co-host"
    const eventId = parseInt(req.params.eventId);
    if(!eventId){
        return res.status(400).json({ message: "Invalid event id" })
    }
    const currentUser = req.user.id;
    const event = await Event.findByPk(eventId);
    if (!event) {
        res.status(404).json({
            "message": "Event couldn't be found"
        })
    } else {
        const groupId = event.groupId;
        const group = await Group.findByPk(groupId);
        const organizerId = group.organizerId;

        const membership = await Membership.findAll({
            where: { groupId: groupId }
        });
        const membershipData = membership.some(member => {
            const memberData = member.toJSON();
            return memberData.userId === currentUser && memberData.status === 'co-host'
        })
       
        if (currentUser === organizerId || membershipData) {
            const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
            //  console.log(price, typeof(price))
            const venue = await Venue.findByPk(venueId);
            if (venue) {
                event.venueId = venueId;
                if (name !== undefined) event.name = name;
                if (type !== undefined) event.type = type;
                if (capacity !== undefined) event.capacity = parseInt(capacity);
                if (price !== undefined) event.price = parseFloat(price);
                if (description !== undefined) event.description = description;
                if (startDate !== undefined) event.startDate = startDate;
                if (endDate !== undefined) event.endDate = endDate;

                await event.save();
                res.status(200).json(event)
            } else {
                res.status(404).json({ message: "Venue could't be found" })
            }
        } else {
            res.status(403).json({ message: "Not allowed" })
        }
    }
})

// Delete an Event specified by its id
router.delete('/:eventId', requireAuth, async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    if(!eventId){
        return res.status(400).json({ message: "Invalid event id" })
    }
    const event = await Event.findByPk(eventId);
    if (event) {
        const currentUser = req.user.id;
        const groupId = event.groupId;
        const group = await Group.findByPk(groupId);
        const organizerId = group.organizerId;

        const membership = await Membership.findAll({
            where: { groupId: groupId }
        });
        const membershipData = membership.some(member => {
            const memberData = member.toJSON();
            return memberData.userId === currentUser && memberData.status === 'co-host'
        })

        if (currentUser === organizerId || membershipData) {
            await event.destroy();
            res.status(200).json({
                "message": "Successfully deleted"
            })
        } else {
            res.status(403).json({ message: "Not allowed" })
        }
    } else {
        res.status(404).json({
            "message": "Event couldn't be found"
        })
    }
})

// Get all Attendees of an Event specified by its id
router.get('/:eventId/attendees', async (req, res) => {
    const eventId = parseInt(req.params.eventId);
    if(!eventId){
        return res.status(400).json({ message: "Invalid event id" })
    }
    const event = await Event.findByPk(eventId);
    const currentUserId = req.user.id;
    if (event) {
        //If you ARE the organizer of the group or a member of the group with a status of "co-host". 
        //Shows all attendees including those with a status of "pending".
        const group = await Group.findByPk(event.groupId);
        if(!group){
            return res.status(404).json({message: 'Group can not found'})
        }
        const organizerId = group.organizerId;

        const membership = await Membership.findOne({
            where: {
                userId: currentUserId,
                groupId: group.id
            }
        });
        if(!membership){
            return res.status(404).json({message: 'No membership between the user and group'})
        }
        const status = membership.status;
        let attendees;
        if (currentUserId === organizerId || status === 'co-host') {
            attendees = await Attendance.findAll({
                where: { eventId: eventId },
                include: {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                }
            });
        } else {//If you ARE NOT the organizer of the group or a member of the group with a status of "co-host". Shows all members that don't have a status of "pending".
            attendees = await Attendance.findAll({
                where: {
                    eventId: eventId,
                    status: {
                        [Op.ne]: 'pending'
                    }
                },
                include: {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                }
            });
        }
        //format response
        const attendeeData = attendees.map(attend => {
            return {
                id: attend.User.id,
                firstName: attend.User.firstName,
                lastName: attend.User.lastName,
                Attendance: {
                    status: attend.status
                }
            }
        });
        res.status(200).json({ "Attendees": attendeeData })
    } else {
        res.status(404).json({
            "message": "Event couldn't be found"
        })
    }
})

// Request to Attend an Event based on the Event's id
router.post('/:eventId/attendance', requireAuth, async (req, res) => {
    //Require Authorization: Current User must be a member of the group
    const eventId = parseInt(req.params.eventId);
    if(!eventId){
        return res.status(400).json({ message: "Invalid event id" })
    }
    const event = await Event.findByPk(eventId);
    const currentUserId = req.user.id;
    if (event) {
        const group = await Group.findByPk(event.groupId);
        const membership = await Membership.findOne({
            where: {
                groupId: group.id,
                userId: currentUserId
            }
        });
        if (membership && (membership.status === 'co-host' || membership.status === 'member')) {
            const attend = await Attendance.findOne({
                where: {
                    eventId: event.id,
                    userId: currentUserId
                }
            });
            if (attend && attend.status === 'pending') {
                res.status(400).json({ message: 'Attendance has already been requested' })
            } else if (attend && attend.status === 'attending') {
                res.status(400).json({ message: 'User is already an attendee of the event' })
            } else if (attend && attend.status === 'waitlist') {
                res.status(400).json({ message: 'User is on the waitlist' })
            } else {
                const newAttendance = await Attendance.create({
                    eventId: eventId,
                    userId: currentUserId,
                    status: 'pending'
                });
                res.status(200).json(newAttendance)
            }
        } else {
            res.status(403).json({ message: 'Not a member of the group' })
        }
    } else {
        res.status(404).json({ message: 'Event could not be found' })
    }
})



// Change the status of an attendance for an event specified by id
router.put('/:eventId/attendance', requireAuth, async (req, res) => {
    //Require proper authorization: Current User must already be the organizer or have a membership to the group with the status of "co-host"
    const eventId = parseInt(req.params.eventId);
    if(!eventId){
        return res.status(400).json({ message: "Invalid event id" })
    }
    const event = await Event.findByPk(eventId);
    const currentUserId = req.user.id;
    if (event) {
        const group = await Group.findByPk(event.groupId);
        if (group) {
            const organizer = group.organizerId;
            const membership = await Membership.findOne({
                where: {
                    userId: currentUserId,
                    groupId: group.id,
                    status: 'co-host'
                }
            });
            if (membership || currentUserId === organizer) {
                const { userId, status } = req.body;
                const user = await User.findByPk(userId);
                if (user) {
                    const attend = await Attendance.findOne({
                        where: {
                            eventId: event.id,
                            userId: userId
                        }
                    });
                    if (attend) {
                        if (status === 'pending') {
                            res.status(400).json({
                                "message": "Bad Request",
                                "errors": {
                                    "status": "Cannot change an attendance status to pending"
                                }
                            })
                        } else {
                            attend.status = status
                            await attend.save();
                            res.status(200).json(attend)
                        }
                    } else {
                        res.status(404).json({
                            "message": "Attendance between the user and the event does not exist"
                        })
                    }
                } else {
                    res.status(404).json({ message: 'User could not be found' })
                }
            } else {
                res.status(403).json({ message: 'Not allowed' })
            }
        } else {
            res.status(404).json({ message: 'Group could not be found' })
        }
    } else {
        res.status(404).json({ message: 'Event could not be found' })
    }

})

// Delete attendance to an event specified by id
router.delete('/:eventId/attendance/:userId', requireAuth, async (req, res) => {
    //Require proper authorization: Current User must be the host of the group, or the user whose attendance is being deleted
    const eventId = parseInt(req.params.eventId);
    if(!eventId){
        return res.status(400).json({ message: "Invalid event id" })
    }
    const currentUser = req.user.id;
    const event = await Event.findByPk(eventId);
    if (event) {
        const group = await Group.findByPk(event.groupId);
        const organizer = group.organizerId;
        const deletedUser = parseInt(req.params.userId);
        if (deletedUser) {
            if (currentUser === organizer || currentUser === deletedUser) {
                const attend = await Attendance.findOne({
                    where: {
                        eventId: event.id,
                        userId: deletedUser
                    }
                });
                if (attend) {
                    await attend.destroy();
                    res.status(200).json({ message: "Successfully deleted attendance from event" })
                } else {
                    res.status(404).json({ message: 'Attendance does not exist for this User' })
                }
            } else {
                res.status(403).json({ message: 'Not allowed' })
            }

        } else {
            res.status(404).json({ message: 'User could not be found' })
        }

    } else {
        res.status(404).json({ message: 'Event could not be found' })
    }
})




module.exports = router;

