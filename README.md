# ClassSaga: A Gamified Classroom Incentive System

## Overview
This project is a web based virtual pet application that is initially inspired by creature caring systems (like Pokemon and Tamagotchi). It is designed specifically for educational settings (classrooms, tutoring, home) as a positive reinforcement incentive system and makes intentional design decisions with this in mind. Students will be able to care for and customize their virtual pet by using points rewarded by their teachers for certain behaviors (turning in assignments, showing kindness, etc.). 

## Problem to be solved
Many students can struggle with motivation in the classroom. This can include difficulties in  maintaining consistent effort, completing assignments, showing positive classroom behaviors, or various other struggles. There are many different kinds of incentive systems that exist, however, there is a lack of a more student-centered and gamified approach.  

## Proposed Solution
My project, ClassSaga, is a student-centered, gamified approach to an incentive system. The virtual pet system is meant to be used as a long-term progression system to engage and motivate students. It will emphasize autonomy and choice in how students interact with the app while being flexible to allow for use in classrooms, tutoring, and home situations. The game elements will be designed to encourage short, but intentional interactions that are interesting enough to get students to be invested, but also not to be able to spend more than a few minutes on the application at a time. It will also be beneficial in giving students something to be responsible for and care for while teaching management of money or points. 

## MVP Scope
- User authentication
  - separate account types for students and teachers/tutors/parents
- Virtual Pet
  - For the MVP there are 3 pet options (1 is chosen at the start)
  - The pet is displayed on the screen for most student interactions in the app 
  - The pet has basic care stats and battle stats that can be viewed and updated
  - Students are able to perform basic care activities for their pet every day that increase stats 
  - Students can also view their inventory and equip owned cosmetic items, use special care items, and swap between pets
  - The pet will perform different animations depending on the way students interact with them
- Point System 
  - Teachers are able to award points to individual students, multiple students, or entire classes
  - The reason for the points and number of points given is customizable (with some defaults available)
  - Points are saved to each of the students individual accounts
- Point Spending
  - Students are able to view their earned points at all times
  - Points can be spent on premium care for the pet (to increase stats) 
  - Students can also purchase cosmetics for customization, more pets, and special care items in the student shop

## Out of Scope (Future Direction)
- More pet, cosmetic, and care options
- Evolution of pets
- Pet battles/competitions (versus NPCs, group battles, etc.)
- Achievements rewarded for different milestones and unlock different rewards
- API connection to Canvas or Google classroom 
- Sign up/in with Google and other options
- Multiplayer (whole class) events
- Built-in academic content (math activities to get more points)
  - AI-driven features

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
  - Optional paid point actions will be available for additional stat benefits
- Rewards
  - Cosmetic, care items, and more pets unlock from point shop
  - Some stat increases are tied to pet care
- Balance
  - Game design must be engaging, but not time consuming (should not be able to play more than a few minutes daily as to not take away from instruction time)
      - Consideration for idle game-like progression
  - There will be no real penalties for a lack of engagement with the app
  - Taking good care of the pet is encouraged although not required through the stat benefits it provides

## How to Run
1. Clone the repository
```
git clone <your-repo-url>
cd MSCS-Spring2026-ArielTang
```
2. Backend setup
```
cd server
npm install
```
Create a .env file in /server.
```
PORT=5050
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```
Start the backend server
```
npm run dev
```
The backend will run on 
```
http://localhost:5050
```
3. Frontend setup 

Open a new terminal and enter:
```
cd client
npm install
npm run dev
```
The frontend will run on 
```
http://localhost:5173
```
