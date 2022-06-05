"use strict";
class Department {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        //private readonly id: string;
        // private name: string;
        this.employees = [];
        // this.name = n;
    }
    static createEmployee(name) {
        return { name: name };
    }
    addEmployee(employee) {
        this.employees.push(employee);
    }
    printEmployeeInformation() {
        console.log(this.employees.length);
        console.log(this.employees);
    }
}
Department.fiscalYear = 2020;
class ITDeparment extends Department {
    constructor(id, admin) {
        super(id, 'IT');
        this.admin = admin;
        this.admins = admin;
    }
    describe() {
        console.log('IT Department -ID: ' + this.id);
    }
}
class AccountingDepartment extends Department {
    constructor(id, reports) {
        super(id, 'Accounting');
        this.reports = reports;
        this.lastReport = reports[0];
    }
    get mostRecentReport() {
        if (this.lastReport) {
            return this.lastReport;
        }
        throw new Error('No report found.');
    }
    set mostRecentReport(value) {
        if (!value) {
            throw new Error('Please enter a valid value');
        }
        this.addReport(value);
    }
    //implementing singleton
    static getInstance() {
        if (AccountingDepartment.instance) {
            return this.instance;
        }
        this.instance = new AccountingDepartment('d2', []);
        return this.instance;
    }
    describe() {
        console.log('Accounting Department -ID: ' + this.id);
    }
    addEmployee(name) {
        if (name === 'Max') {
            return;
        }
        this.employees.push(name);
    }
    addReport(report) {
        this.reports.push(report);
        this.lastReport = report;
    }
    printReports() {
        console.log(this.reports);
    }
}
const employee1 = Department.createEmployee('employee1');
console.log(employee1, Department.fiscalYear);
const it = new ITDeparment('id1', ['Max']);
it.addEmployee('Max');
it.addEmployee('Manu');
it.describe();
it.name = 'NEW NAME';
it.printEmployeeInformation();
console.log(it);
// const accounting = new AccountingDepartment('d2',[]);
const accounting = AccountingDepartment.getInstance();
console.log(accounting);
accounting.mostRecentReport = 'YOUR END REPORT';
accounting.addReport('ALgo va mal');
console.log(accounting.mostRecentReport);
accounting.addEmployee('Max');
accounting.addEmployee('Manu');
// accounting.printReports();
// accounting.printEmployeeInformation();
console.log(accounting.describe());
// accounting.employees[2] = 'Anna';
accounting.printEmployeeInformation();
// const accountingCopy = {name:'s', describe: accounting.describe};
// accountingCopy.describe();
//# sourceMappingURL=classes.js.map