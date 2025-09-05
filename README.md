# CS4800-NVMATech

Recipe Finder — Next.js + TypeScript (Full-Stack)

A full-stack recipe finder where people post recipes and rate others’ dishes. Built with React/Next.js (App Router) + TypeScript.

---

## Stack
Web: Next.js (TS) or React, Tailwind (optional but shadcn/ui gives clean and reusable skeleton UI components)
Data: TBD

---

## Quick Start
- Clone repo --> git clone https://github.com/giahua/CS4800-NVMATech.git
- open in IDE and open a new terminal
- npm install --> installs node and nextjs
- npm run dev --> creates a local host

---

## Layout Skeleton (TODO)
- Global: header (logo, search, auth), footer
- Pages: landing /, feed /app, sign-in/up, profile
- Recipes: create /recipes/new, view /recipes/[id]
- Data: Prisma/Postgres/Any other DB you guys want schema + seed; basic search (title/ingredients)
- Features: (Maybe) have a section where they can access their pantry and list what ingredients they have and get recipes that match available ingredients

---

## NOTES IF YOU AREN'T FAMILIAR WITH FRONT-END DEV:
- take note of the structure of the files, they have several sections or divs --> leads to a "box" style of programming
- overall leads to, conceptually, containers inside of containers especially as your project gets more complex
- Actual containers help with grouping things together 
- since there are boxes inside of boxes --> parent styles that for example have padding push that style onto the children of the container

# IF YOU LOOK INTO THE CODE...
- className = "some sort of style" which links back to globals.css file where you can edit/create/remove styles to make reusable styles for a project
- if you want to add your own styles some popular ways are to add different sub-styles of a bigger style --> btn has btn-accent and btn-login which both look different
- the style I used (Nicholas) uses a lot of padding to create rounded borders and margins to give spacing between text and borders of a component
- was going for a beige and amber color for the page similar to the color scheme of claude.ai's logo 

