const express = require('express');
const router = express.Router();
const { Group, Membership, GroupImage, User, Venue } = require('../../db/models');
const { where } = require('sequelize');
const { sequelize } = require('../../db/models');

const { requireAuth } = require('../../utils/auth');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');


// Edit a Venue specified by its id
const validateVenue = [
    check('address')
        .optional()
        .exists({ checkFalsy: true })
        .withMessage("Street address is required"),
    check('city')
        .optional()
        .exists({ checkFalsy: true })
        .withMessage("City is required"),
    check('state')
        .optional()
        .exists({ checkFalsy: true })
        .withMessage("State is required"),
    check('lat')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be within -90 and 90'),
    check('lng')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be within -180 and 180'),
    handleValidationErrors
]
router.put('/:venueId', requireAuth, validateVenue, async (req, res) => {
    const venueId = parseInt(req.params.venueId);
    if(!venueId){
        return res.status(400).json({ message: "Invalid venue id" })
    }
    const currentUser = req.user.id;
    const venue = await Venue.findByPk(venueId);
    if (venue) {
        const groupId = venue.groupId;
        if(!groupId){
            return res.status(400).json({message:'No group id'})
        }
        const group = await Group.findByPk(groupId);
        if(!group){
            return res.status(400).json({message:'No group'})
        }
        const membership = await Membership.findAll({
            where: { userId: currentUser }
        });
        if(!membership){
            return res.status(400).json({message:'No membership'})
        }
        if (currentUser === group.organizerId || membership.status === 'co-host') {
            const { address, city, state, lat, lng } = req.body;
            if(address) venue.address = address;
            if(city) venue.city = city;
            if(state) venue.state = state;
            if(lat) venue.lat = lat;
            if(lng) venue.lng = lng;

            await venue.save();
            res.status(200).json(venue)
        } else {
            res.status(403).json({ message: 'Not allowed' })
        }
    } else {
        res.status(404).json({
            "message": "Venue couldn't be found"
        })
    }
})

module.exports = router;