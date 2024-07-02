const express = require('express');
const router = express.Router();

const { Group, Membership, GroupImage, User, Venue, Event, Attendance, EventImage } = require('../../db/models');
const { sequelize } = require('../../db/models');

const { Op } = require('sequelize');

const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const moment = require('moment');//The moment module is a JavaScript library for parsing, validating, manipulating, and formatting dates.
const { handleValidationErrors } = require('../../utils/validation');


//GET ALL GROUPS
/*
Performance Considerations: Depending on the number of groups and members, 
the first approach might have performance implications due to multiple database queries. 
For large datasets, I consider optimizing the database queries using the second approach, which 
leverages Sequelize's association capabilities to fetch the related data and include the member count directly in the query result.
*/
//FIRST approach: 
// router.get(
//     '/',
//    async(req,res) => {
//         const groups = await Group.findAll();
//         const groupsWithMeb = await Promise.all(groups.map(async(group) => {//Promise.all ensures that we wait for all asynchronous operations to complete before proceeding.
//             const numMembers = await Membership.count({//Membership.count to count the number of members where the groupId matches the current group's id.
//                 where: {
//                     groupId: group.id
//                 }
//             });
//             return {
//                 ...group.toJSON(), //Converting to Plain Object: group.toJSON() is called on each group instance to convert it to a plain JavaScript object. The toJSON method(or .get({ plain: true });) is available on individual Sequelize instances, not on an array of instances returned by findAll.
//                 numMembers
//             }
//         }));
//         res.json({
//             'Groups':groupsWithMeb
//         })
//     }
// )
//SECOND approach
router.get(
    '/',
    async (req, res) => {
        const groups = await Group.findAll({
            include: [{
                model: Membership,
                attributes: []
            },
            {
                model: GroupImage,
                as: 'previewImage',
                attributes: ['url', 'groupId', 'id'],
                where: {
                    preview: true,
                },
                required: false
            }
            ],
            attributes: {
                include: [
                    [sequelize.fn('COUNT', sequelize.col('Memberships.groupId')), 'numMembers']
                ]
            },
            group: ['Group.id', 'previewImage.groupId', 'previewImage.id']//When include an associated model (like Membership) and perform an aggregate operation (like COUNT), Sequelize needs to know how to group the results. By grouping the results by the Group.id, you ensure that each group's results are distinct and the count is accurate for each group.when you use GROUP BY, all selected columns that are not aggregated must be included in the GROUP BY clause to ensure correct grouping.
        });

        const jsonGroup = groups.map(group => {
            const jsonG = group.toJSON();
            return {
                id: jsonG.id,
                organizerId: jsonG.organizerId,
                name: jsonG.name,
                about: jsonG.about,
                type: jsonG.type,
                private: jsonG.private,
                city: jsonG.city,
                state: jsonG.state,
                createdAt: jsonG.createdAt,
                updatedAt: jsonG.updatedAt,
                numMembers: jsonG.numMembers,
                previewImage: jsonG.previewImage.length ? jsonG.previewImage[0].url : null
            }

        })

        res.json({ 'Groups': jsonGroup })
    }
)

// GET GROUPS BY CURRENT USER
router.get(
    '/current',
    requireAuth,
    async (req, res) => {
        const currentUser = req.user; //req.user contains user information after authentication
        const currentUserId = currentUser.id;
        const groups = await Group.findAll({
            where: { organizerId: currentUserId },
            include: [{
                model: Membership,
                attributes: []
            },
            {
                model: GroupImage,
                as: 'previewImage',
                attributes: ['url', 'groupId', 'id'],
                // where: {
                //     preview: true,
                // },
                required: false
            }
            ],
            attributes: {
                include: [
                    [sequelize.fn('COUNT', sequelize.col('Memberships.groupId')), 'numMembers']
                ]
            },
            group: ['Group.id', 'previewImage.groupId', 'previewImage.id']
        });

        const jsonGroup = groups.map(group => {
            const jsonG = group.toJSON();
            return {
                id: jsonG.id,
                organizerId: jsonG.organizerId,
                name: jsonG.name,
                about: jsonG.about,
                type: jsonG.type,
                private: jsonG.private,
                city: jsonG.city,
                state: jsonG.state,
                createdAt: jsonG.createdAt,
                updatedAt: jsonG.updatedAt,
                numMembers: jsonG.numMembers,
                previewImage: jsonG.previewImage.length ? jsonG.previewImage[0].url : null
            }

        })

        res.json({ 'Groups': jsonGroup })
    }
)


// GET details of a Group from an id
router.get(
    '/:groupId',
    async (req, res) => {
        const groupId = parseInt(req.params.groupId);
        if (groupId) {
            const groups = await Group.findOne({
                where: { id: groupId },
                include: [{
                    model: GroupImage,
                    // as: 'GroupImages',
                    attributes: { exclude: ['createdAt', 'updatedAt'] },
                },
                {
                    model: User,
                    as: 'Organizer',
                    attributes: ['id', 'firstName', 'lastName']
                },
                {
                    model: Venue,
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                }]
            });
            if (groups) {
                res.json(groups)
            } else {
                res.status(404).json({
                    "message": "Group couldn't be found",
                })
            }
        }else {
            res.status(400).json({ message: "Invalid group id" })
        }
    }
)

// CREATE a Group
const isValidGroupType = (value) => { //custom validation for type
    return ['Online', 'In person'].includes(value)
};
const validateGroup = [
    check('name')
        // .exists({ checkFalsy: true })//This method checks if the field exists in the request. The option { checkFalsy: true } ensures that the field is not only present but also not falsy (i.e., it can't be false, null, 0, "", etc.).
        // .notEmpty()
        // .withMessage('Name is required')
        .isLength({ max: 60 })
        .withMessage('Name must be 60 characters or less'),
    check('about')
        // .exists({ checkFalsy: true })
        .isLength({ min: 50 })
        .withMessage('About must be 50 characters or more'),
    check('type')
        .custom(isValidGroupType)
        .withMessage("Type must be 'Online' or 'In person'"),
    check('private')
        .isBoolean()
        .withMessage('Private must be a boolean'),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage('City is required'),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage('State is required'),
    handleValidationErrors //handles any validation errors that occur, formatting and sending them back to the client if needed.
];
router.post('/', requireAuth, validateGroup, async (req, res) => {
    const { name, about, type, private, city, state } = req.body;
    const newGroup = await Group.create({
        organizerId: parseInt(req.user.id),
        name,
        about,
        type,
        private,
        city,
        state
    });
    res.status(201).json(newGroup)
})

// ADD IMG to a Group based on the Group's id
router.post('/:groupId/images', requireAuth, async (req, res) => {
    // Require proper authorization: Current User must be the organizer for the group
    const currentUser = req.user.id;
    const groupId = parseInt(req.params.groupId);
    if (groupId) {
        const group = await Group.findByPk(groupId);
        if (group) {
            const organizer = group.organizerId;
            if (organizer === currentUser) {
                const { url, preview } = req.body;
                const newImg = await GroupImage.create({
                    groupId,
                    url,
                    preview
                });
                res.status(200).json(newImg);
            } else {
                res.status(403).json({ message: 'You are not the organizer, you cannot add image for this group.' })
            }

        } else {
            res.status(404).json({ message: "Group could't be found" })
        }
    } else {
        res.status(400).json({ message: "Invalid group id" })
    }
})

// EDIT A GROUP
const validateUpdateGroup = [
    check('name')
        .optional()//The optional() method in the validation middleware ensures that the fields are only validated if they are present in the request body.
        .isLength({ max: 60 })
        .withMessage('Name must be 60 characters or less'),
    check('about')
        .optional()
        .isLength({ min: 50 })
        .withMessage('About must be 50 characters or more'),
    check('type')
        .optional()
        .isIn(['Online', 'In person'])
        .withMessage("Type must be 'Online' or 'In person'"),
    check('private')
        .optional()
        .isBoolean()
        .withMessage('Private must be a boolean'),
    check('city')
        .optional()
        .notEmpty()
        .withMessage('City is required'),
    check('state')
        .optional()
        .notEmpty()
        .withMessage('State is required'),
    handleValidationErrors
];

router.put('/:groupId', requireAuth, validateUpdateGroup, async (req, res) => {
    // Require proper authorization: Current User must be the organizer for the group
    const currentUser = req.user.id;
    const groupId = parseInt(req.params.groupId);
    if (groupId) {
        const group = await Group.findByPk(groupId);

        if (group) {
            const organizer = group.organizerId;
            if (organizer === currentUser) {
                const { name, about, type, private, city, state } = req.body;
                if (name) group.name = name;
                if (about) group.about = about;
                if (type) group.type = type;
                if (private !== undefined) group.private = private;//when updating the private field(value of true or false), the value false is considered falsy, so the logic (if (private) group.private = private;) will skip updating the field if private is false.
                if (city) group.city = city;
                if (state) group.state = state;

                await group.save();

                res.status(200).json(group);
            } else {
                res.status(403).json({ message: 'You are not the organizer, you cannot edit this group.' })
            }
        } else {
            res.status(404).json({ message: "Group could't be found" })
        }
    } else {
        res.status(400).json({ message: "Invalid group id" })
    }
});

// DELETE A GROUP
router.delete('/:groupId', requireAuth, async (req, res) => {
    const currentUser = req.user.id;
    const groupId = parseInt(req.params.groupId);
    if (groupId) {
        const group = await Group.findByPk(groupId);

        if (group) {
            const organizer = group.organizerId;
            if (organizer === currentUser) {
                await group.destroy();
                res.status(200).json({ message: 'Successfully deleted' });
            } else {
                res.status(403).json({ message: 'You are not the organizer, you cannot delete this group.' })
            }
        } else {
            res.status(404).json({ message: "Group could't be found" })
        }
    } else {
        res.status(400).json({ message: "Invalid group id" })
    }
});

// Get All Venues for a Group specified by its id
router.get('/:groupId/venues', requireAuth, async (req, res) => {
    const currentUser = req.user.id;
    const groupId = parseInt(req.params.groupId);
    if (groupId) {
        const group = await Group.findByPk(groupId);
        const membership = await Membership.findAll({
            where: { userId: currentUser }
        });
        if(!membership){
            return res.status(404).json({message: 'No membership between the user and group'})
        }
        if (group) {
            if (currentUser === group.organizerId || membership.status === 'co-host') {
                const venue = await Venue.findAll({
                    where: { groupId: groupId }
                });
                res.json(venue)
            } else {
                res.status(403).json({ message: 'You can not access to this infomation' })
            }
        } else {
            res.status(404).json({
                "message": "Group couldn't be found"
            })
        }
    } else {
        res.status(400).json({ message: "Invalid group id" })
    }
})

// Create a new Venue for a Group specified by its id
const validateVenue = [
    check('address')
        .exists({ checkFalsy: true })
        .withMessage("Street address is required"),
    check('city')
        .exists({ checkFalsy: true })
        .withMessage("City is required"),
    check('state')
        .exists({ checkFalsy: true })
        .withMessage("State is required"),
    check('lat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be within -90 and 90'),
    check('lng')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be within -180 and 180'),
    handleValidationErrors
]
router.post('/:groupId/venues', requireAuth, validateVenue, async (req, res) => {
    //Require Authorization: Current User must be the organizer of the group or a member of the group with a status of "co-host"
    const currentUser = req.user.id;
    const groupId = parseInt(req.params.groupId);
    if (groupId) {
        const group = await Group.findByPk(groupId);
        const membership = await Membership.findAll({
            where: { userId: currentUser }
        })

        if (group) {
            if (currentUser === group.organizerId || membership.status === 'co-host') {
                const { address, city, state, lat, lng } = req.body;
                const newVenue = await Venue.create({
                    groupId: groupId,
                    address,
                    city,
                    state,
                    lat,
                    lng
                });
                res.json(newVenue)
            } else {
                res.status(403).json({ message: 'Not allowed' })
            }
        } else {
            res.status(404).json({
                "message": "Group couldn't be found"
            })
        }
    } else {
        res.status(400).json({ message: "Invalid group id" })
    }
});

// Get all Events of a Group specified by its id
router.get('/:groupId/events', async (req, res) => {
    const groupId = parseInt(req.params.groupId);
    if(groupId){
    const group = await Group.findByPk(groupId);
    if (group) {
        const events = await Event.findAll({
            where: { groupId: groupId },
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
                attributes: ['url', 'id', 'eventId'],
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
            group: ['Event.id', 'previewImage.eventId', 'Group.id', 'Venue.id', 'previewImage.id']
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
    } else {
        res.status(404).json({
            "message": "Group couldn't be found"
        })
    }
}else {
    res.status(400).json({ message: "Invalid group id" })
}
});

// Create an Event for a Group specified by its id
const validateEvent = [
    check('name')
        .isLength({ min: 5 })
        .withMessage("Name must be at leaset 5 characters"),
    check('type')
        .custom(isValidGroupType)
        .withMessage("Type must be 'Online' or 'In person'"),
    check('capacity')
        .isInt()
        .withMessage("Capacity must be an integer"),
    check('price')
        .isNumeric()
        .custom(value => {
            if (value < 0) {
                throw Error('Price must be a positive number')
            }
            return true;
        })
        .toFloat()
        .withMessage("Price is invalid"),
    check('description')
        .exists({ checkFalsy: true })
        .withMessage('Description is required'),
    check('startDate')
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
]
router.post('/:groupId/events', requireAuth, validateEvent, async (req, res) => {
    const currentUser = req.user.id;
    const groupId = parseInt(req.params.groupId);
    if(groupId){
        const group = await Group.findByPk(groupId);
        const membership = await Membership.findAll({
            where: { userId: currentUser }
        })
    
        if (group) {
            if (currentUser === group.organizerId || membership.status === 'co-host') {
                const { venueId, name, type, capacity, price, description, startDate, endDate } = req.body;
                const venue = await Venue.findByPk(venueId);
                if (venue) {
                    const newEvent = await Event.create({
                        groupId: parseInt(groupId),
                        venueId: parseInt(venueId),
                        name,
                        type,
                        capacity: parseInt(capacity, 10),
                        price: parseInt(price),
                        description,
                        startDate,
                        endDate
                    });
                    res.json(newEvent)
                } else {
                    res.status(404).json({ message: 'Venue could not be found' })
                }
            } else {
                res.status(403).json({ message: 'Not allowed' })
            }
        } else {
            res.status(404).json({
                "message": "Group couldn't be found"
            })
        }

    }else {
        res.status(400).json({ message: "Invalid group id" })
    }
})

// Get all Members of a Group specified by its id
router.get('/:groupId/members', async (req, res) => {
    //If you ARE the organizer or a co-host of the group. Shows all members and their statuses.
    const currentUser = req.user.id;
    const groupId = parseInt(req.params.groupId);
    if(groupId){
    const group = await Group.findByPk(groupId);
    const membership = await Membership.findOne({
        where: { userId: currentUser }
    });
    if(!membership){
        return res.status(404).json({message: 'No membership between the user and group'})
    }
    if (group) {
        let members;
        if (currentUser === group.organizerId || membership.status === 'co-host') {
            members = await Membership.findAll({
                where: { groupId: groupId },
                include: {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                }
            });

        } else {//If you ARE NOT the organizer of the group. Shows only members that don't have a status of "pending".
            members = await Membership.findAll({
                where: {
                    groupId: groupId,
                    status: {
                        [Op.ne]: 'pending'
                    }
                },
                include: {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                }
            })
        }
        // format the response
        const memberData = members.map(member => {
            return {
                id: member.User.id,
                firstName: member.User.firstName,
                lastName: member.User.lastName,
                Membership: {
                    status: member.status
                }
            }
        })
        res.json({ "Members": memberData })
    } else {
        res.status(404).json({
            "message": "Group couldn't be found"
        })
    }}else {
        res.status(400).json({ message: "Invalid group id" })
    }
});

// Request a Membership for a Group based on the Group's id
router.post('/:groupId/membership', requireAuth, handleValidationErrors, async (req, res) => {
    const groupId = parseInt(req.params.groupId);
    if (groupId) {
        const group = await Group.findByPk(req.params.groupId);
        if (group) {
            const currentUser = req.user.id;
            const membership = await Membership.findOne({
                where: { userId: currentUser },
                where: { groupId: groupId }
            });
            // console.log(membership)
            if (membership && membership.status === 'pending') {
                res.status(400).json({ "message": "Membership has already been requested" })
            } else if (membership && membership.status === 'member') {
                res.status(400).json({ "message": "User is already a member of the group" })
            } else if (membership && membership.status === 'co-host') {
                res.status(400).json({ "message": "User is already a co-host of the group" })
            } else {
                const newMember = await Membership.create({
                    userId: currentUser,
                    groupId: groupId,
                    status: 'pending'
                })
                res.status(200).json(newMember)
            }
        } else {
            res.status(404).json({
                "message": "Group couldn't be found"
            })
        }
    } else {
        res.status(400).json({
            "message": "Invalide group id"
        })
    }

});

// CHANGE the status of a membership for a group specified by id
/*
Require proper authorization:
To change the status from "pending" to "member":
    Current User must already be the organizer or have a membership to the group with the status of "co-host"
To change the status from "member" to "co-host":
    Current User must already be the organizer
*/
const validateEditMembership = [
    check('status')
        .exists({ checkFalsy: true })
        .custom((value) => {
            if (value === 'pending') {
                throw Error("Cannot change a membership status to pending")
            }
            return true;
        }),
    handleValidationErrors
]
router.put('/:groupId/membership', requireAuth, validateEditMembership, async (req, res) => {
    const groupId = parseInt(req.params.groupId);
    if(groupId){
    const group = await Group.findByPk(groupId);
    const currentUser = req.user.id;
    if (group) {
        const { memberId, status } = req.body;
        const member = await Membership.findByPk(memberId);
        if (member) {
            const user = await User.findByPk(member.userId);
            if (user) {
                const membership = await Membership.findOne({
                    where: { userId: memberId },
                    where: { groupId: groupId }
                });
                if (membership) {
                    if (status === 'member') {
                        const currentUserMembership = await Membership.findOne({
                            where: { userId: currentUser }
                        });
                        if(!currentUserMembership){
                            return res.status(400).json({message: 'No membership'})
                        }
                        if (currentUser === group.organizerId || currentUserMembership.status === 'co-host') {
                            member.status = status;
                            await member.save();
                            res.status(200).json(member);
                        } else {
                            res.status(403).json({
                                "message": "Not allowed"
                            })
                        }
                    } else if (status === 'co-host') {
                        if (currentUser === group.organizerId) {
                            member.status = status;
                            await member.save();
                            res.status(200).json(member);
                        } else {
                            res.status(403).json({
                                "message": "Not allowed"
                            })
                        }
                    }
                } else {
                    res.status(404).json({
                        "message": "Membership between the user and the group does not exist"
                    })
                }
            } else {
                res.status(404).json({
                    "message": "User couldn't be found"
                })
            }
        } else {
            res.status(404).json({
                "message": "User couldn't be found"
            })
        }
    } else {
        res.status(404).json({
            "message": "Group couldn't be found"
        })
    }}else {
        res.status(400).json({ message: "Invalid group id" })
    }
})

// Delete membership to a group specified by id
router.delete('/:groupId/membership/:memberId', requireAuth, async (req, res) => {
    // Require proper authorization: Current User must be the host of the group, 
    //or the user whose membership is being deleted
    const groupId = parseInt(req.params.groupId);
    if(!groupId){
        return res.status(400).json({ message: "Invalid group id" })
    }
    const membershipId = parseInt(req.params.memberId);
    if(!membershipId){
        return res.status(400).json({ message: "Invalid membership id" })
    }
    const currentUserId = req.user.id;

    try {
        //check if the group exists
        const group = await Group.findByPk(groupId);
        if (!group) {
            return res.status(404).json({
                "message": "Group couldn't be found"
            })
        }
        //check if the membership exists
        const membership = await Membership.findByPk(membershipId);
        if (!membership) {
            return res.status(404).json({
                "message": "Membership does not exist for this User"
            })
        }
        //check if the user associated with the membership exists
        const user = await User.findByPk(membership.userId);
        if (!user) {
            return res.status(404).json({
                "message": "User couldn't be found"
            })
        }
        //check if the current user is authorized to delete the membership
        if (currentUserId === group.organizerId || currentUserId === membership.userId) {
            await membership.destroy();
            res.status(200).json({
                "message": "Successfully deleted membership from group"
            })
        } else {
            res.status(403).json({
                "message": "Not allowed"
            })
        }

    } catch (error) {
        res.status(500).json({ "message": "An error occurred while trying to delete the membership" })
    }
})


module.exports = router;