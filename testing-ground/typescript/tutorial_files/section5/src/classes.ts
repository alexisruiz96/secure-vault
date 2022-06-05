abstract class Department {
    static fiscalYear = 2020;
    //private readonly id: string;
    // private name: string;
    protected employees: string[] = [];
    
    constructor(protected readonly id:string, public name:string){
        // this.name = n;
    }

    static createEmployee(name: string){
        return {name: name}
    }   
    abstract describe(this: Department) :void;

    addEmployee(employee: string){
        this.employees.push(employee);
    }

    printEmployeeInformation(){
        console.log(this.employees.length);
        console.log(this.employees);
    }
}

class ITDeparment extends Department{
    
    admins: string[];
    constructor(id: string, public admin: string[]){
        super(id,'IT');
        this.admins = admin;

    }

    describe() {
        console.log('IT Department -ID: ' + this.id);
    }
}

class AccountingDepartment extends Department{

    private lastReport: string;
    private static instance: AccountingDepartment;

    get mostRecentReport(){
        if(this.lastReport){
            return this.lastReport;
        }
        throw new Error('No report found.');
    }

    set mostRecentReport(value: string){
        if(!value){
            throw new Error('Please enter a valid value');
        }
        this.addReport(value);
    }

    private constructor(id: string, private reports: string[]){
        super(id,'Accounting');
        this.lastReport = reports[0];
    }

    //implementing singleton
    static getInstance(){
        if(AccountingDepartment.instance){
            return this.instance;
        }
        this.instance = new AccountingDepartment('d2',[]);
        return this.instance;
        
    }

    describe() {
        console.log('Accounting Department -ID: ' + this.id);
    }

    addEmployee(name: string): void {
        if(name==='Max'){
            return;
        }
        this.employees.push(name)
    }

    addReport(report: string){
        this.reports.push(report);
        this.lastReport = report;
    }

    printReports(){
        console.log(this.reports)
    }
}


const employee1 = Department.createEmployee('employee1');
console.log(employee1, Department.fiscalYear)

const it = new ITDeparment('id1',['Max']);
it.addEmployee('Max');
it.addEmployee('Manu');


it.describe();
it.name = 'NEW NAME';
it.printEmployeeInformation()

console.log(it);

// const accounting = new AccountingDepartment('d2',[]);
const accounting = AccountingDepartment.getInstance()

console.log(accounting)

accounting.mostRecentReport = 'YOUR END REPORT';
accounting.addReport('ALgo va mal');
console.log(accounting.mostRecentReport);

accounting.addEmployee('Max');
accounting.addEmployee('Manu');

// accounting.printReports();
// accounting.printEmployeeInformation();

console.log(accounting.describe())
// accounting.employees[2] = 'Anna';

accounting.printEmployeeInformation()

// const accountingCopy = {name:'s', describe: accounting.describe};

// accountingCopy.describe();