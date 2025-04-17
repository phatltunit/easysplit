# **App Name**: BillSplitter

## Core Features:

- Participant Management: Manage a list of participants with the ability to add, edit, and delete names. Participants associated with existing expenses cannot be deleted.
- Expense Management: Add new expenses, including name, amount, payer (dropdown from participant list), and involved participants (checkboxes with 'Select All'/'Deselect All'). Implement a split evenly toggle, and if disabled, allow manual input of contributions with validation.
- Calculation and Result Display: Display calculated individual contributions and balances in collapsible sections. Generate a transaction breakdown, listing who owes whom, combining transactions where possible and automatically inverting transactions for clarity.
- Expense List Management: Allow users to edit or delete existing expenses, ensuring automatic recalculation and updates of balances and transaction summaries.
- Footer: Display a footer with the text 'Made with ♥️ by phat' and include author copyright information.

## Style Guidelines:

- Primary color: Pastel orange for a soft, friendly feel.
- Secondary colors: Neutral grays and whites to provide a clean backdrop.
- Accent: Teal (#008080) for interactive elements.
- Roboto font family for a modern and readable experience.
- Mobile-first, responsive design with collapsible sections to organize information.
- Use clear, simple icons from Material Design to represent actions and data.

## Original User Request:
Develop a responsive web application, "SplitBill," using React.js and MUI, designed specifically for splitting group expenses related to meals and coffee outings among friends. The application will focus heavily on mobile optimization, featuring a clean, modern UI with pastel orange as the primary color and the Roboto font.

Functional Requirements:
1. Participant Management
Initial State: User-defined participant list; initially empty.

Constraint: Participants associated with recorded expenses cannot be deleted from the participants list.

2. Expense Management
Adding New Expenses: Allow users to create expenses with the following fields:

Expense Name (string)

Amount (number)

Payer (dropdown menu populated from participants list)

Participants involved in the expense (checkbox selection)

Include “Select All” / “Deselect All” functionality.

Split Evenly Toggle (iOS-style toggle switch):

If enabled, automatically split the amount evenly among selected participants.

If disabled, provide fields for manually inputting individual participant contributions.

Implement validation logic to ensure that the sum of individual contributions exactly matches the total expense amount.

3. Calculation and Result Display
Upon saving an expense:

Calculations: Automatically compute individual contributions and balances.

Results Section: Clearly divided into two collapsible/expandable subsections:

Individual Summary: Show net balances per participant.

Transaction Breakdown: List required transactions specifying clearly who owes whom and how much, with detailed transaction calculations:

Transactions must occur only among participants involved in the same expense.

Combine multiple transactions where possible (if payer and recipient pairs repeat across expenses).

Automatically invert transactions if totals become negative, to clearly reflect payment direction.

4. Expense List Management
Allow users to edit or delete existing expenses.

Ensure recalculation and automatic updates of balances and transaction summaries upon any modifications.

Technical and Design Specifications:
Technology Stack:

Frontend Framework: React.js (compatible with GitHub Pages deployment).

UI Component Library: MUI (Material UI).

Supporting Technologies: HTML/CSS/JavaScript and additional React libraries for UI enhancement and responsiveness.

Design & UI/UX:

UI Style: Modern, minimalist, and intuitive.

Primary Color: Pastel orange.

Typography: Roboto font family.

Mobile-first Design: Fully optimized for mobile devices (responsive design imperative).

UI Elements: Use collapsible sections extensively to maintain clarity and visual tidiness.

Error Handling and Exception Management:
Implement robust error handling and input validation for all user interactions.

Ensure smooth user experience by gracefully managing exceptional states (e.g., inconsistent input, incorrect totals, network errors).

Branding & Footer:
Clearly display a footer at the bottom of the page with text:

"Made with ♥️ by phat"

Include appropriate author copyright.
  