const Employee = require("../models/employeeModel");

const getEmployees = async (req, res) => {
  try {
    const { status, shift, day } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (shift) filter.shift = shift;
    if (day) filter[`weekly.${day}`] = { $ne: "Off" };
    res.json(await Employee.find(filter).populate("user", "name email role").sort({ name: 1 }));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getEmployeeSummary = async (req, res) => {
  try {
    const day = req.query.day || "Mon";
    const employees = await Employee.find();
    const workingToday = employees.filter((employee) => employee.status === "Active" && employee.weekly?.[day] !== "Off");
    res.json({
      day,
      activeToday: workingToday.length,
      cashiersToday: workingToday.filter((employee) => employee.role.toLowerCase() === "cashier").length,
      activeStaff: employees.filter((employee) => employee.status === "Active").length,
      totalStaff: employees.length,
      onLeave: employees.filter((employee) => employee.status === "On Leave").length,
      workingToday
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createEmployee = async (req, res) => {
  try {
    res.status(201).json(await Employee.create(req.body));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { returnDocument: "after", runValidators: true });
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEmployees, getEmployeeSummary, createEmployee, updateEmployee, deleteEmployee };
