<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Firma-check web application

All routes and user interface shall be in the Czech language.

The application is designed for quickly verifying basic information about a Czech company. The user enters the company identification number (IČO), and optionally the company name, clicks a button, and the application verifies the company via ARES, displays the basic information, shows the company’s headquarters on a map, allows the user to save the company to a list, and export the saved companies.

# Architecture and formatting

## Naming React components

Both filenames and component names are to be written in CamelCase.

## Naming non-component files

If a file exports a single function, name the file after that function (camelCase). For example, a file exporting `validateIco` is named `validateIco.ts`.

## TSDoc comments

Every exported function must have a TSDoc comment (`/** … */`) with at minimum a one-line description and `@param` / `@returns` tags.

## Database and SQL queries

If possible database related code should be in a "db" folder. sql-wasm-browser.wasm file is an exception.

They are to be written in separate functions/constants. So that the code is more readable.
