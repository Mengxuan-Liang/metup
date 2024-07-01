const express = require('express');
const router = express.Router();
const { Group, Membership, GroupImage } = require('../../db/models');
const { requireAuth } = require('../../utils/auth');


// Delete an Image for a Group
router.delete('/:imageId', requireAuth, async(req,res)=> {
    //Require proper authorization: Current user must be the organizer or "co-host" of the Group
    const imageId = parseInt(req.params.imageId);
    if(!imageId){
        return res.status(400).json({ message: "Invalid image id" })
    }
    const groupImg = await GroupImage.findByPk(imageId);
    const currentUser = req.user.id;
    if(groupImg){
        const group = await Group.findByPk(groupImg.groupId);
        const organizer = group.organizerId;
        const membership = await Membership.findOne({
            where: {
                userId: currentUser,
                groupId: group.id
            }
        });
        if((membership && membership.status === 'co-host') || currentUser === organizer){
            await groupImg.destroy();
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
            "message": "Group Image couldn't be found"
          })
    }
})







module.exports = router;