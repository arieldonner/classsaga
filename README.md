# EduSaga Companions (temp name): A Virtual Pet Incentive System for Education

## Overview
This project will be a web based virtual pet application that is initially inspired by creature caring systems (like Pokemon and Tamagotchi). It will be designed specifically for educational settings (classrooms, tutoring, home) as a positive reinforcement incentive system. Students will be able to care for and customize their virtual pet by using points rewarded by their teachers for certain behaviors (turning in assignments, showing kindness, etc.). 

## Problem to be solved
Many students can struggle with motivation in the classroom. This can include difficulties in  maintaining consistent effort, completing assignments, showing positive classroom behaviors, or various other struggles. There are many different kinds of incentive systems that exist, however, there is a lack of a more student-centered and gamified approach.  

## Proposed Solution
My project will be a student-centered, gamified approach to an incentive system. The virtual pet system will be used as a long-term progression system to engage and motivate students. It will emphasize autonomy and choice in how students interact with the app while being flexible to allow for use in classrooms, tutoring, and home situations. The game elements will be designed to encourage short, but intentional interactions that are interesting enough to get students to be invested, but also not to be able to spend more than a few minutes on the application at a time. It will also be beneficial in giving students something to be responsible for and care for while teaching management of money or points. 

## MVP Scope
- User authentication
  - separate account types for students and teachers/tutors/parents
- Virtual Pet
  - For the MVP there will only be 1 pet option 
  - The pet will appear and “move” on screen after students log in 
  - The pet will have some basic stats that can be viewed and updated
  - Students will be able to perform basic care activities for their pet every day that increase stats 
  - Students will be able to take part in asynchronous competitions (“battles”?) against other pets.
- Point System 
  - Teachers should be able to award points to individual students, multiple students, or entire classes
  - The reason for the points and number of points given should be customizable (with some defaults available and the option to save pre-set values)
  - Points will be saved to each of the students individual accounts
- Point Spending
  - Students will be able to view and spend their earned points 
  - Points can be spent on premium care for the pet (to increase stats) or cosmetic customization
- Achievements/Badges
  - There will be different achievements/badges rewarded for different milestones that students hit.
  - Achievements can give various different rewards

## Out of Scope (Future Direction)
- Built-in academic content (math activities to get more points)
  - AI-driven features
- Multiple pet options 
- Evolution and/or growth of pets
- More cosmetic customization options
- Student-run market/ability to trade items
- Connection to Canvas or Google classroom 

## Basic Technology Stack
- React
- Node.js
- Express
- MongoDB
- JWT authentication

## User Roles
- Student
  - View and interact with virtual pet
  - Gain and spend points on pet-related activities
- Teacher/Tutor/Parent
  - Award points to individual students or groups
  - Ability to manage students and classes

## Initial Game Design Considerations
- Pet care
  - Basic care actions will be available once a day at no cost
  - Optional paid point actions will be available for additional benefits (stats, achievements, etc.)
- Rewards
  - Cosmetic unlocks from point shop, achievements, and progression
  - Some stat increases will be tied to pet care
  - Achievements will be awarded based on certain engagement and progression levels
- Balance
  - Game design must be engaging, but not time consuming (should not be able to play more than a few minutes daily to not take away from instruction time)
      - Consideration for idle game-like progression
  - There will be no penalties for a lack of engagement with the app
