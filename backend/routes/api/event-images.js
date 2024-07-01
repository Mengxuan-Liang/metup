const express = require('express');
const router = express.Router();

const { Group, Membership, GroupImage, User, Venue, Event, Attendance, EventImage } = require('../../db/models');
const { sequelize } = require('../../db/models');

const { Op, where } = require('sequelize');

const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const moment = require('moment');
const { handleValidationErrors } = require('../../utils/validation');

// Delete an Image for an Event
router.delete('/:imageId', requireAuth, async(req,res)=> {
    //Require proper authorization: Current user must be the organizer or "co-host" of the Group that the Event belongs to.
    const imageId = parseInt(req.params.imageId);
    if(!imageId){
        return res.status(400).json({ message: "Invalid image id" })
    }
    const eventImg = await EventImage.findByPk(imageId);
    const currentUser = req.user.id;
    if(eventImg){
        const event = await Event.findByPk(eventImg.eventId);
        const group = await Group.findByPk(event.groupId);
        const organizer = group.organizerId;
        const membership = await Membership.findOne({
            where: {
                userId: currentUser,
                groupId: group.id,
                status: 'co-host'
            }
        });
        if(membership || currentUser === organizer){
            await eventImg.destroy();
            res.status(200).json({
                "message": "Successfully deleted"
              })
        }else {
            res.status(403).json({
                "message": "Not allowed"
            })
        }
    }else {
        res.status(404).json({
            "message": "Event Image couldn't be found"
          })
    }
})







module.exports = router;