# Software Requirements Specification (SRS) — GATHER by NVMA Tech LLC

_Published on: 09/26/2025_

_Prepared by: Gia Minh Hua, Thu Nguyen, An Nguyen, Nicholas Perez, Viet Tran_

Software Requirements Specification

(SRS) Document

Project GATHER by NVMA Tech LLC

Published on 09/26/2025

Prepared By: Gia Minh Hua, Thu Nguyen, An Nguyen, Nicholas Perez, Viet Tran

## Table of Contents

1. Introduction

### 1.1 Purpose

### 1.2 Company

### 1.3 Project Scope

### 1.4 Client

2. Requirements

### 2.1 Functional Requirements

### FR1: User Account Creation

### FR2: Log In

### FR3: Log Out

### FR4: Create Recipe Post

### FR5: Display Recipe Posts

### FR6: Search Recipes by Name

### FR7: Search Recipes by Category

### FR8: Search Recipes by Ingredient

### FR9: Like / Comment

### FR10: Mark Favorite Recipes

### FR11: Follow Users

### FR12: Rating

### 2.2 Non-Functional Requirements

### NFR1: Ease of Use

### NFR2: User Interface

### NFR3: Performance

### NFR4: Availability

### NFR5: Compatibility

### NFR6: Deployment

### NFR7: Maintainability and Scalability

### NFR8: Data Accuracy and Privacy

### NFR9: Security

3. Agreement

1. Introduction

### 1.1 Purpose

This document provides a detailed description of the project Gather. Designed and developed by

NVMA Tech for our client, Edwin Rodríguez, it will define the purpose and scope of the project,

outline the system’s core features such as recipe posting, commenting, rating, and following.

Describe how the application responds to user interactions, and specify both the limitations and

the non-functional requirements that ensure usability, security, and reliability.

### 1.2 Company

We are a small, dedicated team that specializes in building software and websites tailored to what

our customers actually need. Every business is different, so instead of pushing one-size-fits-all

products, we focus on understanding your goals and creating solutions that are practical, easy to

use, and ready to grow with you. Being a small company, we prioritize keeping things simple,

clear, and personal. We believe technology should be something that supports your business, not

something you have to struggle with. That is why we make it a priority to deliver solutions that

not only meet today’s needs but can also adapt to tomorrow’s opportunities. At the end of the

day, our mission is simple: to make technology approachable and useful, so you can focus on

what you do best while we handle the rest.

### 1.3 Project Scope

NVMA Tech will deliver a focused recipe web application covering core use cases: users can

browse and search by name, ingredient, or category, apply basic dietary filters, view a clear

recipe page (ingredients, steps, time, servings), sign in to save favorites, and share recipes via

link. We will seed a small set of recipes and provide a responsive, straightforward UI. In short,

we want to achieve a platform where cooking is no longer a challenge and picking what to eat is

not too complicated.

The landing page will feature a search bar that acts as the starting point for the experience.

Guests and logged-in users alike should be able to type in ingredients, cuisines, or dish names

and instantly find recipes that match what they are looking for. This easy search function ensures

the app is useful right from the first click, even for those who haven’t created an account yet.

### 1.4 Client

Our client, Edwin Rodríguez, is an individual seeking a social media application that facilitates

online networking, content sharing, and user engagement. Mr. Rodríguez requires a platform that

allows users to create personal profiles, connect with others, post updates, share media, and

interact through likes, comments, and other engagement features. He wants to focus on usability,

responsiveness, and scalability, and expects the application to handle typical social networking

interactions efficiently. Mr. Rodríguez serves as the primary stakeholder who will provide

feedback on requirements, evaluate functionality, and ensure that the final product aligns with

user needs and industry standards.

The client’s vision is to create a web application that makes discovering and sharing recipes both

simple and fun. At its core, the platform should feel welcoming to everyone, from casual visitors

who just want to quickly search for a meal idea to passionate food lovers who want to share their

own creations and connect with others. Hence the name, Gather.

For registered users, the application becomes much more personal. The client desires a smooth

account system that includes sign-up, login, and logout, making it simple to start building a

profile and contributing to the community. Logged-in users should be able to post their own

recipes with photos, descriptions, and instructions, giving them a space to showcase their

creativity and share their favorite dishes.

2. Requirements

### 2.1 Functional Requirements

### FR1: User Account Creation

**Description**

Users should be able to create an account that provides access to the application’s core features.

Account creation links directly to every other interactive function within the application,

including posting recipes, commenting, liking other posts, and marking favorite recipes. Once

created, the account will maintain a persistent record of user activity, such as recipes shared,

favorites saved, and community interactions.

**Details**

1. The system should provide a “Sign Up” button for new users to initiate account creation.

2. When signing up, the system requires users to input the following information:

- Username

- Password

- Date of Birth

- Email address or Phone number (for password recovery in case users forgot their

passwords)

3. The system should verify that the chosen username is unique. If it is already taken, a message

should be displayed prompting the user to select another.

4. The system should enforce password strength rules, requiring:

- Minimum length

- At least one uppercase and one lowercase letter.

- At least one digit

- At least one special character

5. The system should create the account successfully only after validating the username and

password criteria, and the user confirms by clicking the “Sign Up” button.

6. The system should securely store usernames and encrypted passwords in the database.

**Rationale**

To provide users with secure access to personalized and interactive features of the web app.

### FR2: Log In

**Description**

The system should allow registered users to log in securely using their account credentials.

Successful login grants access to personalized features tied to the user’s profile. Logging in

ensures that the user can resume their personalized session, with saved favorites, posted recipes,

and community interactions loaded into their dashboard.

**Details**

1. The system should provide two input fields on the login pages: username and password.

2. Users could submit the credentials after clicking the “Log In” button.

3. The system should verify the entered username and password.

4. If the credentials are correct, the user should be granted access, and the system will redirect

the user to the home page or dashboard.

5. If the credentials are incorrect, the system should display an error message without revealing

sensitive information (e.g., “Invalid username or password”).

6. The system should provide a “Forgot my password” option in case users need to reset their

passwords.

**Rationale**

To authenticate users and ensure secure access to their accounts.

### FR3: Log Out

**Description**

The system should allow logged-in users to securely log out of their accounts, ending the active

session.

**Details**

1. The system should provide a “Log Out” button accessible from the navigation menu or user

profile.

2. Clicking “Log Out” immediately terminates the current session.

3. After logging out, the system will redirect the user to the login page or home page.

4. The system should prevent further access to personalized content until the user logs in again.

**Rationale**

To ensure users can securely end sessions, protecting their accounts from unauthorized access.

### FR4: Create Recipe Post

**Description**

The system should allow users with active accounts to create and submit new recipe posts,

including text, images, and tags for categorization.

**Details**

1. Users should be able to access the recipe creation feature via a textbox or icon on the home

page.

2. The system should provide a recipe composition dialog or form that allows users to:

- Enter free-form text for recipe content

- Format recipes as step-by-step instructions

- Upload one or more images along with a recipe post

- Select one or more tags (e.g., vegan, dairy, fried, healthy) to categorize the recipe.

3. A recipe will be posted after users click the “Post” button.

4. After this, the recipe and its associated information (text, images, tags) will be added to the

database. Every posted recipe will connect to the recipe database, which stores nutritional and

dietary information such as protein, carbohydrates, and gluten-free indicators.

**Rationale**

To enable users to compose and share new recipe content.

### FR5: Display Recipe Posts

**Description**

The system should display recipe posts created by users in a clear and engaging format across the

application, including the homepage feed, search results, and user profiles

**Details**

1. The system should display recipe posts with the following information:

- Recipe title

- Thumbnail or featured image (if available)

- Author/creator name (linked to their profile)

- Tags or categories (e.g., vegan, dairy-free, healthy)

- A short preview of the recipe content (e.g., first few lines or summary)

- Number of likes and comments

2. The system should allow users to click on a recipe post to view its full details, including all

text, step-by-step instructions, images, tags, and nutritional information.

3. The system should ensure recipe posts are properly formatted for readability on both desktop

and mobile devices.

4. The system should update displayed posts dynamically when new posts are created or existing

posts are edited/deleted.

**Rationale**

To ensure recipe content is presented in a user-friendly way, encouraging discovery, interaction,

and engagement within the application.

### FR6: Search Recipes by Name

**Description**

The system should allow users to search recipes using recipe names. Searching functions as a

discovery tool, bridging user interests with community-created content.

**Details**

1. The system should provide a search bar accessible from the homepage and key navigation

areas.

2. Users should be able to enter recipe names (full or partial) into the search bar.

3. The system should return all recipes whose names match (exact or partial match) the entered

text.

4. The results should include the recipe name, thumbnail image, creator’s name, tags/categories,

and a short preview.

5. If no recipes match, the system shall display a “No results found” message.

**Rationale**

To enable users to locate recipes by title quickly.

### FR7: Search Recipes by Category

**Description**

The system should allow users to search recipes by selecting one or multiple dietary categories.

**Details**

1. Users should be able to filter recipes by category (e.g., vegan, dairy-free, gluten-free, healthy).

2. Users may select multiple categories simultaneously.

3. The system should display all recipes tagged with the selected categories.

4. The results should include the recipe name, thumbnail image, creator’s name, tags/categories,

and a short preview.

5. If no recipes match, the system shall display a “No results found” message.

**Rationale**

To help users discover recipes based on dietary preferences or cooking styles.

### FR8: Search Recipes by Ingredient

**Description**

The system should allow users to search recipes by one or more ingredients.

**Details**

1. Users should be able to input one or multiple ingredients into the search bar.

2. The system should display all recipes that contain the specified ingredient(s).

3. Users should be able to refine results by adding or removing ingredients.

4. The results should include the recipe name, thumbnail image, creator’s name, tags/categories,

and a short preview.

5. If no recipes match, the system shall display a “No results found” message.

**Rationale**

To help users discover recipes based on available or desired ingredients.

### FR9: Like / Comment

**Description**

Users may engage with posted recipes through likes and comments. Post creators can enable or

disable likes/comments, giving them control over how feedback is managed on their

contributions. Likes and comments also connect with account data (FR1), ensuring that each

interaction is tied to a user profile for future reference.

**Details**

1. Users could “Like” a recipe post by clicking an icon/button (could be a special design that is

related to food and drink).

2. Each user may like a recipe once. By clicking the button again, the like will be removed.

3. The total number of likes on each post will also be displayed.

4. Users could also “Comment” under any post, and their comments will be displayed along with

the usernames and timestamps.

5. All likes and comments should be stored properly in the database and linked to the

corresponding user account.

**Rationale**

Facilitate meaningful engagement and feedback between users.

### FR10: Mark Favorite Recipes

**Description**

Users can mark recipes or discussion posts as favorites, storing them in a personal “My Recipes”

tab. Favorited items are persistently saved, ensuring users can return to them even after logging

out and back in (FR2). This feature builds long-term engagement by creating a curated collection

of content meaningful to each user.

**Details**

1. A “Favorite” button/icon is displayed on each recipe post.

2. When the button is clicked, a recipe will be added to the user’s favorite list. By clicking the

button again, the user can remove that recipe from their list.

**Rationale**

Allow users to revisit preferred content.

### FR11: Follow Users

**Description**

Users can follow other accounts to keep up with their recipes, posts, and discussions. Following

another user ensures that their recipes and discussions appear more prominently in the follower’s

feed and search results (FR4). This feature builds long-term connections within the community

and encourages sustained interaction between users.

**Details**

1. When viewing a creator’s post, you can follow them by clicking the “plus” icon next to their

profile or by going to their profile page and clicking the “Follow” button.

2. Once followed, the “Plus” icon will change to a “Checked” icon, indicating that you are now

following them.

3. You can click the “Checked” icon again to unfollow them.

4. Your profile will include a section that displays separate lists of users you follow and users

who follow you.

5. Once a user follows someone, the following list is updated, and the other user will have one

more follower. This information will be updated in the database.

**Rationale**

Support building personalized recipe communities.

### FR12: Rating

**Description**

Users should be able to rate other users’ recipes on a 5-star scale. Each recipe’s overall rating

should be calculated as the average of all user ratings. A user may update their rating at any time,

and the system should ensure that each user can only submit one rating per recipe.

**Details**

1. The recipe page displays a 5-star control and an info line like “Average 4.3★(27 ratings)”.

2. Guests can see the average and count; the stars are disabled with a “Sign in to rate” prompt.

3. A signed-in user clicks a star (1–5) to create their rating.

4. Clicking a different star updates that user’s rating for the same recipe.

5. After rating, the page shows the updated average (1 decimal) and updated total count.

**Rationale**

To allow the community to provide feedback on recipes and help users discover high-quality

content.

### 2.2 Non-Functional Requirements

### NFR1: Ease of Use

Description: The application should be simple and intuitive so that new users can quickly

understand how to search for recipes, post their own, and interact with others without needing

extra help.

### NFR2: User Interface

Description: The application’s design should be clean, simple, and easy to navigate with the

buttons, menus, and search functions should be clearly visible and labeled, so users don’t feel

lost. The interface should be consistent across all pages, with a friendly and welcoming style that

matches the purpose of a recipe-sharing platform.

### NFR3: Performance

Description: The platform should load quickly, and searches or recipe posts should respond

within a few seconds to keep the user experience smooth.

### NFR4: Availability

Description: The application should be reliable and accessible most of the time, with minimal

downtime, so users can search and share recipes whenever they want.

### NFR5: Compatibility

Description: The application should work well across common web browsers and devices

(desktop, tablet, and mobile), ensuring a consistent experience.

### NFR6: Deployment

Description: The application will be hosted on Vercel, ensuring quick and reliable delivery of

the website to users worldwide. The system will use a managed cloud database (Neon Postgres)

to store recipes, user accounts, likes, comments, and other data securely.

### NFR7: Maintainability and Scalability

Description: The system should be built in a way that makes it easy to update, fix problems, or

add new features in the future without major disruptions. The system should be able to handle

growth in the number of users, recipes, likes, and comments without slowing down as the

community expands.

### NFR8: Data Accuracy and Privacy

Description: When users search, like, comment, or follow, the results and updates should always

reflect correctly without delays or errors. The platform should respect user privacy, ensuring that

only intended information (such as public recipes or profiles) is visible to others, while private

details remain protected.

### NFR9: Security

Description: User accounts and personal information should be kept safe through secure login

methods and protection of stored data.

3. Agreement

By signing this agreement, both parties are accepting all requirements as specified above.

Client Representative

Name: ________________________________

Signature: _____________________________

Date: _________________________________

Company Representative

Name: ________________________________

Signature: _____________________________

Date: _________________________________


