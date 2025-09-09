import { parseCSV } from "../src/basic-parser";
import * as path from "path";
import { z } from "zod";

// Paths to CSV files
const PEOPLE_CSV_PATH = path.join(__dirname, "../data/people.csv");
const STUDENTS_CSV_PATH = path.join(__dirname, "../data/students.csv");
const ROLE_CSV_PATH = path.join(__dirname, "../data/role.csv");

// Schema for people (name + numeric age)
const PersonSchema = z.tuple([z.string(), z.coerce.number()]).transform(([name, age]) => ({ name, age }));
type Person = z.infer<typeof PersonSchema>;

// Schema for students (name, credits, email)
const StudentSchema = z.tuple([z.string(), z.coerce.number(), z.email()]).transform(([name, credits, email]) => ({ name, credits, email }));
type Student = z.infer<typeof StudentSchema>;

// Schema for role.csv rows (name1, name2, course, role)
const RoleSchema = z.tuple([z.string(), z.string(), z.string(), z.string()]).transform(([name1, name2, course, role]) => ({ name1, name2, course, role }));
type Role = z.infer<typeof RoleSchema>;


test("parseCSV rejects invalid rows with schema", async () => {
  // "Bob,thirty" should cause validation to fail
  await expect(parseCSV<Person>(PEOPLE_CSV_PATH, PersonSchema)).rejects.toThrow(/CSV validation failed/);
});

test("parseCSV validates and transforms valid student rows", async () => {
  // "Bob,11,not-an-email" should fail because the email is invalid
  await expect(parseCSV<Student>(STUDENTS_CSV_PATH, StudentSchema)).rejects.toThrow(/CSV validation failed/);
});

 //Good test for role.csv
 //All rows are valid, so parseCSV should return Role objects
test("parseCSV parses role.csv rows into objects with schema", async () => {
  const results = await parseCSV(ROLE_CSV_PATH, RoleSchema);

  // Just check that each result has the expected keys
  for (const row of results) {
    expect(row).toHaveProperty("name1");
    expect(row).toHaveProperty("name2");
    expect(row).toHaveProperty("course");
    expect(row).toHaveProperty("role");
  }
});

// Old test with no schema, should pass as before
test("parseCSV yields only arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH)
  for(const row of results) {
    expect(Array.isArray(row)).toBe(true);
  }
});


// import { parseCSV } from "../src/basic-parser";
// import * as path from "path";

// const PEOPLE_CSV_PATH = path.join(__dirname, "../data/people.csv");

// test("parseCSV yields arrays", async () => {
//   const results = await parseCSV(PEOPLE_CSV_PATH)
  
//   expect(results).toHaveLength(5);
//   expect(results[0]).toEqual(["name", "age"]);
//   expect(results[1]).toEqual(["Alice", "23"]);
//   expect(results[2]).toEqual(["Bob", "thirty"]); // why does this work? :(
//   expect(results[3]).toEqual(["Charlie", "25"]);
//   expect(results[4]).toEqual(["Nim", "22"]);
// });

// test("parseCSV yields only arrays", async () => {
//   const results = await parseCSV(PEOPLE_CSV_PATH)
//   for(const row of results) {
//     expect(Array.isArray(row)).toBe(true);
//   }
// });