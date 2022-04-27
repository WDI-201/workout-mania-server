const Workouts = require('../model/Workouts');
const User = require('../../users/model/User');
const { isAlpha, isInt } = require('validator');
const { errorHandler } = require('../../users/utils/errorHandler');
const router = require('../workoutsRouter');

const createWorkout = async (req, res) => {
    try {
        const { workoutName, workoutReps, workoutSets, weight } = req.body;
        

        let errObj = {};

        if (!isAlpha(workoutName)) {
            errObj.workoutName = "Alphabet only!";
        }
        if (Object.keys(errObj).length > 0) {
            return res.status(500).json({ message: "Error", error: errObj });
        }

        const decodedData = res.locals.decodedToken;
        const foundUser = await User.findOne({ email: decodedData.email });
        if (!foundUser) throw { message: "User not found " };

        const newWorkout = new Workouts({
            workoutName: workoutName,
            workoutReps: workoutReps,
            workoutSets: workoutSets,
            weight: weight,
            workoutOwner: foundUser._id,
        });

        const savedWorkout = await newWorkout.save();

        foundUser.workoutHistory.push(savedWorkout.id);
        await foundUser.save();

        res.status(200).json({ message: "Workout saved successfully", payload: savedWorkout });
    } catch (error) {
        res.status(500).json(errorHandler(error));
        console.log(error);
    }
};
const getAllWorkouts = async (req, res) => {
    try {
        const decodedData = res.locals.decodedToken;

        const foundUser = await User.findOne({ email: decodedData.email });
        if(!foundUser) throw { message: "User not found" };

        const foundWorkouts = await Workouts({ workoutOwner: foundUser.id });
        console.log("USER:",foundWorkouts);
        res.status(200).json({ payload: foundWorkouts });
    } catch (error) {
        res.status(500).json({ message: "Error", error: error.message });
        console.log(error);
    }
};
module.exports = {
    createWorkout,
    getAllWorkouts
}