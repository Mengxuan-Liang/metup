const express = require('express');
const router = express.Router();

const {Group, Membership} = require('../../db/models');
const { where } = require('sequelize');
const {sequelize} = require('../../db/models')

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
//                 ...group.toJSON(), //Converting to Plain Object: group.toJSON() is called on each group instance to convert it to a plain JavaScript object. This method is called inside the map function for each group instance.
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
    async(req,res) => {
        const groups = await Group.findAll({
            include: [{
                model: Membership,
                attributes: []
            }
            ],
            attributes: {
                include:[
                    [sequelize.fn('COUNT', sequelize.col('groupId')), 'numMembers']
                ]
            },
            group: ['Group.id']//When include an associated model (like Membership) and perform an aggregate operation (like COUNT), Sequelize needs to know how to group the results. By grouping the results by the Group.id, you ensure that each group's results are distinct and the count is accurate for each group.
        });
        res.json({'Groups':groups})
    }
)











module.exports = router;