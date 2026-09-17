// Static exercise database for the workout "Add Exercise" picker.
// Each entry: id, name, category (muscle group), equipment.
export const EXERCISES = [
  // Chest
  { id: "e1", name: "Bench Press", category: "Chest", equipment: "Barbell" },
  { id: "e2", name: "Incline Bench Press", category: "Chest", equipment: "Barbell" },
  { id: "e3", name: "Dumbbell Bench Press", category: "Chest", equipment: "Dumbbell" },
  { id: "e4", name: "Incline Dumbbell Press", category: "Chest", equipment: "Dumbbell" },
  { id: "e5", name: "Chest Fly", category: "Chest", equipment: "Dumbbell" },
  { id: "e6", name: "Cable Crossover", category: "Chest", equipment: "Cable" },
  { id: "e7", name: "Push Up", category: "Chest", equipment: "Bodyweight" },
  { id: "e8", name: "Dips", category: "Chest", equipment: "Bodyweight" },

  // Back
  { id: "e9", name: "Deadlift", category: "Back", equipment: "Barbell" },
  { id: "e10", name: "Pull Up", category: "Back", equipment: "Bodyweight" },
  { id: "e11", name: "Lat Pulldown", category: "Back", equipment: "Cable" },
  { id: "e12", name: "Barbell Row", category: "Back", equipment: "Barbell" },
  { id: "e13", name: "Dumbbell Row", category: "Back", equipment: "Dumbbell" },
  { id: "e14", name: "Seated Cable Row", category: "Back", equipment: "Cable" },
  { id: "e15", name: "T-Bar Row", category: "Back", equipment: "Barbell" },
  { id: "e16", name: "Face Pull", category: "Back", equipment: "Cable" },

  // Shoulders
  { id: "e17", name: "Overhead Press", category: "Shoulders", equipment: "Barbell" },
  { id: "e18", name: "Dumbbell Shoulder Press", category: "Shoulders", equipment: "Dumbbell" },
  { id: "e19", name: "Lateral Raise", category: "Shoulders", equipment: "Dumbbell" },
  { id: "e20", name: "Front Raise", category: "Shoulders", equipment: "Dumbbell" },
  { id: "e21", name: "Rear Delt Fly", category: "Shoulders", equipment: "Dumbbell" },
  { id: "e22", name: "Arnold Press", category: "Shoulders", equipment: "Dumbbell" },
  { id: "e23", name: "Shrugs", category: "Shoulders", equipment: "Barbell" },

  // Arms
  { id: "e24", name: "Barbell Curl", category: "Biceps", equipment: "Barbell" },
  { id: "e25", name: "Dumbbell Curl", category: "Biceps", equipment: "Dumbbell" },
  { id: "e26", name: "Hammer Curl", category: "Biceps", equipment: "Dumbbell" },
  { id: "e27", name: "Preacher Curl", category: "Biceps", equipment: "Barbell" },
  { id: "e28", name: "Tricep Pushdown", category: "Triceps", equipment: "Cable" },
  { id: "e29", name: "Skull Crusher", category: "Triceps", equipment: "Barbell" },
  { id: "e30", name: "Overhead Tricep Extension", category: "Triceps", equipment: "Dumbbell" },
  { id: "e31", name: "Close Grip Bench Press", category: "Triceps", equipment: "Barbell" },

  // Legs
  { id: "e32", name: "Back Squat", category: "Legs", equipment: "Barbell" },
  { id: "e33", name: "Front Squat", category: "Legs", equipment: "Barbell" },
  { id: "e34", name: "Leg Press", category: "Legs", equipment: "Machine" },
  { id: "e35", name: "Romanian Deadlift", category: "Legs", equipment: "Barbell" },
  { id: "e36", name: "Lunges", category: "Legs", equipment: "Dumbbell" },
  { id: "e37", name: "Leg Extension", category: "Legs", equipment: "Machine" },
  { id: "e38", name: "Leg Curl", category: "Legs", equipment: "Machine" },
  { id: "e39", name: "Calf Raise", category: "Legs", equipment: "Machine" },
  { id: "e40", name: "Hip Thrust", category: "Legs", equipment: "Barbell" },
  { id: "e41", name: "Bulgarian Split Squat", category: "Legs", equipment: "Dumbbell" },

  // Core
  { id: "e42", name: "Plank", category: "Core", equipment: "Bodyweight" },
  { id: "e43", name: "Crunches", category: "Core", equipment: "Bodyweight" },
  { id: "e44", name: "Hanging Leg Raise", category: "Core", equipment: "Bodyweight" },
  { id: "e45", name: "Russian Twist", category: "Core", equipment: "Bodyweight" },
  { id: "e46", name: "Cable Woodchopper", category: "Core", equipment: "Cable" },
  { id: "e47", name: "Ab Wheel Rollout", category: "Core", equipment: "Bodyweight" },

  // Cardio / Full body
  { id: "e48", name: "Treadmill Run", category: "Cardio", equipment: "Machine" },
  { id: "e49", name: "Rowing Machine", category: "Cardio", equipment: "Machine" },
  { id: "e50", name: "Jump Rope", category: "Cardio", equipment: "Bodyweight" },
  { id: "e51", name: "Burpees", category: "Full Body", equipment: "Bodyweight" },
  { id: "e52", name: "Kettlebell Swing", category: "Full Body", equipment: "Kettlebell" },
  { id: "e53", name: "Clean and Jerk", category: "Full Body", equipment: "Barbell" },
  { id: "e54", name: "Snatch", category: "Full Body", equipment: "Barbell" },
];

export const CATEGORIES = ["All", ...Array.from(new Set(EXERCISES.map((e) => e.category)))];