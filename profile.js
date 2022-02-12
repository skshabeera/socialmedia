const express=require("express");
const router=express.Router();
const { check,validationResult } = require("express-validator");

const auth= require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User= require('../../models/User');
//@route Get api/profile
//@desc Get user 
//@access Private
router.get("/", auth, async (req,res)=> {
    try{
        const profile = await Profile.findOne({ user: req.user.id }).populate('user',['name','avatar'])
        if(!profile){
            return res.status(400).json( { msg: "there is no profile for this user" })
        }
        res.json(profile)

    }catch(err){
        console.error(err.message);
        res.status(500).send("server errror");
    }
});
router.post('/',
    [auth,
        [
        check ('status','status is required').not().isEmpty(),
        check('skills','skills is required').not().isEmpty()
        ]
    ],
async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
    const {
        company,
        website,
        location,
        bio,
        status,
        githubUserName,
        skills,
        youtube,
        twitter,
        facebook,
        instagram,
        linkedin
    } = req.body;
    // Build Profile object
    const profileFields = {}
    profileFields.user = req.user.id;
    if(company) profileFields.company = company
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubUserName) profileFields.githubUserName = githubUserName;
    if (skills){
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }
    // // Build social object
    profileFields.social = {}
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook= facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;
    try{
        let profile =  await Profile.findOne({  user: req.user.id });
        if(profile){
            profile = await Profile.findOneAndUpdate( { user: req.user.id }, { $set : profileFields }, { new: true });
            return res.json(profile)
        }
        profile = new Profile(profileFields)
        await profile.save();
        res.json(profile)
    }catch(err){
       console.error(err.message);
       res.status(500).send('Server Error')
    }
}
);
router.get('/',async (req,res) => {
    try{
        const profiles = await Profile.find().populate('user',['name','avatar'])
        res.json(profiles)
    }catch(err){
        console.error(err.message);
        res.status(500).send('server Error')
    }
});

router.get('/user/:user_id',async (req,res) => {
    try{
        const profile = await Profile.findOne( { user: req.params.uesr_id }).populate('user',['name','avatar'])
        if(!profile) return res.status(400).json({ msg:"there is no profile for user"})
        res.json(profile)
    }catch(err){
        console.error(err.message);
        res.status(500).send('server Error')
    }
});
module.exports = router;

