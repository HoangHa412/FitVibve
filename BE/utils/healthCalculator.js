const calculateBMI = (weight, heightCm) => {
    const heightM = heightCm / 100;
    const bmi = weight / (heightM * heightM);
    let category = '';

    if (bmi < 18.5) category = 'Thiếu cân (Gầy)';
    else if (bmi >= 18.5 && bmi <= 24.9) category = 'Bình thường';
    else if (bmi >= 25 && bmi <= 29.9) category = 'Thừa cân';
    else category = 'Béo phì';

    return {
        bmi: parseFloat(bmi.toFixed(2)),
        category,
    };
};

const calculateBMR = (weight, heightCm, age, gender) => {
    // Mifflin-St Jeor Equation
    let bmr = 10 * weight + 6.25 * heightCm - 5 * age;
    if (gender === 'male') {
        bmr += 5;
    } else if (gender === 'female') {
        bmr -= 161;
    } else {
        // Average for 'other'
        bmr -= 78;
    }
    return Math.round(bmr);
};

// Activity level multiplier (we assume 1.25 as default for light activity unless otherwise stated)
const calculateTDEE = (bmr, activityLevel = 1.25) => {
    return Math.round(bmr * activityLevel);
};

// Target calories based on goal
const calculateTargetCalories = (tdee, goal) => {
    if (goal === 'weight_loss') return tdee - 500;
    if (goal === 'muscle_gain') return tdee + 500;
    return tdee;
};

module.exports = { calculateBMI, calculateBMR, calculateTDEE, calculateTargetCalories };
