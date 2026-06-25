export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  memberId: string;
  plan: 'Core' | 'Plus' | 'Premium';
  status: 'Active' | 'Inactive' | 'Pending';
  primaryCarePhysician?: string;
  employer: string;
  enrolledDate: string;
  email: string;
  phone: string;
}

export interface Claim {
  id: string;
  memberId: string;
  claimNumber: string;
  serviceDate: string;
  provider: string;
  serviceType: 'Medical' | 'Pharmacy' | 'Dental' | 'Vision' | 'Mental Health';
  status: 'Pending' | 'Approved' | 'Denied' | 'In Review';
  billedAmount: number;
  allowedAmount: number;
  memberResponsibility: number;
  planPaid: number;
  diagnosis: string;
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  npi: string;
  networkStatus: 'In-Network' | 'Out-of-Network';
  address: string;
  city: string;
  state: string;
  phone: string;
  acceptingPatients: boolean;
  rating: number;
}

export interface CareEpisode {
  id: string;
  memberId: string;
  title: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedNavigator: string;
  createdDate: string;
  lastUpdated: string;
  category: 'Surgery' | 'Chronic' | 'Mental Health' | 'Maternity' | 'Cancer' | 'General';
  notes: string;
}

export const members: Member[] = [
  { id: 'm001', firstName: 'James', lastName: 'Hartwell', dateOfBirth: '1978-03-14', memberId: 'TC-100001', plan: 'Premium', status: 'Active', primaryCarePhysician: 'Dr. Sandra Cho', employer: 'Apex Industries', enrolledDate: '2023-01-15', email: 'james.hartwell@apexind.com', phone: '(512) 555-0101' },
  { id: 'm002', firstName: 'Maria', lastName: 'Delgado', dateOfBirth: '1985-07-22', memberId: 'TC-100002', plan: 'Plus', status: 'Active', primaryCarePhysician: 'Dr. Kevin Park', employer: 'Bluestone Financial', enrolledDate: '2023-02-01', email: 'mdelgado@bluestone.com', phone: '(214) 555-0202' },
  { id: 'm003', firstName: 'Robert', lastName: 'Nguyen', dateOfBirth: '1990-11-08', memberId: 'TC-100003', plan: 'Core', status: 'Active', employer: 'TechBridge Corp', enrolledDate: '2023-03-10', email: 'rnguyen@techbridge.io', phone: '(415) 555-0303' },
  { id: 'm004', firstName: 'Priya', lastName: 'Sharma', dateOfBirth: '1982-05-30', memberId: 'TC-100004', plan: 'Premium', status: 'Active', primaryCarePhysician: 'Dr. Lisa Montoya', employer: 'Apex Industries', enrolledDate: '2023-01-15', email: 'psharma@apexind.com', phone: '(512) 555-0404' },
  { id: 'm005', firstName: 'David', lastName: 'Chen', dateOfBirth: '1975-09-17', memberId: 'TC-100005', plan: 'Plus', status: 'Inactive', employer: 'Meridian Health Systems', enrolledDate: '2023-04-01', email: 'dchen@meridianhs.com', phone: '(312) 555-0505' },
  { id: 'm006', firstName: 'Angela', lastName: 'Brooks', dateOfBirth: '1993-01-25', memberId: 'TC-100006', plan: 'Core', status: 'Active', employer: 'Sunrise Retail Group', enrolledDate: '2023-05-20', email: 'abrooks@sunrise.com', phone: '(404) 555-0606' },
  { id: 'm007', firstName: 'Michael', lastName: 'Torres', dateOfBirth: '1988-06-12', memberId: 'TC-100007', plan: 'Plus', status: 'Active', primaryCarePhysician: 'Dr. James Okafor', employer: 'Vector Logistics', enrolledDate: '2023-06-01', email: 'mtorres@vector.com', phone: '(713) 555-0707' },
  { id: 'm008', firstName: 'Sarah', lastName: 'Whitfield', dateOfBirth: '1980-12-03', memberId: 'TC-100008', plan: 'Premium', status: 'Active', primaryCarePhysician: 'Dr. Sandra Cho', employer: 'Bluestone Financial', enrolledDate: '2023-02-01', email: 'swhitfield@bluestone.com', phone: '(214) 555-0808' },
  { id: 'm009', firstName: 'Carlos', lastName: 'Mendez', dateOfBirth: '1995-04-18', memberId: 'TC-100009', plan: 'Core', status: 'Pending', employer: 'TechBridge Corp', enrolledDate: '2024-01-10', email: 'cmendez@techbridge.io', phone: '(415) 555-0909' },
  { id: 'm010', firstName: 'Jennifer', lastName: 'Kim', dateOfBirth: '1987-08-29', memberId: 'TC-100010', plan: 'Plus', status: 'Active', primaryCarePhysician: 'Dr. Kevin Park', employer: 'Meridian Health Systems', enrolledDate: '2023-07-15', email: 'jkim@meridianhs.com', phone: '(312) 555-1010' },
  { id: 'm011', firstName: 'William', lastName: 'Foster', dateOfBirth: '1972-02-14', memberId: 'TC-100011', plan: 'Premium', status: 'Active', primaryCarePhysician: 'Dr. Lisa Montoya', employer: 'Apex Industries', enrolledDate: '2023-01-15', email: 'wfoster@apexind.com', phone: '(512) 555-1111' },
  { id: 'm012', firstName: 'Aisha', lastName: 'Johnson', dateOfBirth: '1991-10-07', memberId: 'TC-100012', plan: 'Core', status: 'Active', employer: 'Sunrise Retail Group', enrolledDate: '2023-08-01', email: 'ajohnson@sunrise.com', phone: '(404) 555-1212' },
  { id: 'm013', firstName: 'Thomas', lastName: 'Reyes', dateOfBirth: '1983-03-21', memberId: 'TC-100013', plan: 'Plus', status: 'Active', primaryCarePhysician: 'Dr. James Okafor', employer: 'Vector Logistics', enrolledDate: '2023-06-01', email: 'treyes@vector.com', phone: '(713) 555-1313' },
  { id: 'm014', firstName: 'Lisa', lastName: 'Patel', dateOfBirth: '1989-07-05', memberId: 'TC-100014', plan: 'Premium', status: 'Active', primaryCarePhysician: 'Dr. Sandra Cho', employer: 'Bluestone Financial', enrolledDate: '2023-09-01', email: 'lpatel@bluestone.com', phone: '(214) 555-1414' },
  { id: 'm015', firstName: 'Kevin', lastName: 'Okonkwo', dateOfBirth: '1977-11-19', memberId: 'TC-100015', plan: 'Core', status: 'Inactive', employer: 'Meridian Health Systems', enrolledDate: '2023-04-01', email: 'kokonkwo@meridianhs.com', phone: '(312) 555-1515' },
  { id: 'm016', firstName: 'Rachel', lastName: 'Sullivan', dateOfBirth: '1994-05-27', memberId: 'TC-100016', plan: 'Plus', status: 'Active', primaryCarePhysician: 'Dr. Kevin Park', employer: 'TechBridge Corp', enrolledDate: '2024-01-01', email: 'rsullivan@techbridge.io', phone: '(415) 555-1616' },
  { id: 'm017', firstName: 'Daniel', lastName: 'Huang', dateOfBirth: '1986-09-13', memberId: 'TC-100017', plan: 'Premium', status: 'Active', primaryCarePhysician: 'Dr. Lisa Montoya', employer: 'Apex Industries', enrolledDate: '2023-01-15', email: 'dhuang@apexind.com', phone: '(512) 555-1717' },
  { id: 'm018', firstName: 'Natasha', lastName: 'Williams', dateOfBirth: '1992-01-31', memberId: 'TC-100018', plan: 'Core', status: 'Active', employer: 'Sunrise Retail Group', enrolledDate: '2023-10-15', email: 'nwilliams@sunrise.com', phone: '(404) 555-1818' },
  { id: 'm019', firstName: 'Marcus', lastName: 'Coleman', dateOfBirth: '1979-06-08', memberId: 'TC-100019', plan: 'Plus', status: 'Pending', employer: 'Vector Logistics', enrolledDate: '2024-02-01', email: 'mcoleman@vector.com', phone: '(713) 555-1919' },
  { id: 'm020', firstName: 'Elena', lastName: 'Vasquez', dateOfBirth: '1988-12-24', memberId: 'TC-100020', plan: 'Premium', status: 'Active', primaryCarePhysician: 'Dr. James Okafor', employer: 'Bluestone Financial', enrolledDate: '2023-11-01', email: 'evasquez@bluestone.com', phone: '(214) 555-2020' },
];

export const claims: Claim[] = [
  { id: 'c001', memberId: 'm001', claimNumber: 'CLM-2024-0001', serviceDate: '2024-01-10', provider: 'Austin Regional Clinic', serviceType: 'Medical', status: 'Approved', billedAmount: 850.00, allowedAmount: 720.00, memberResponsibility: 150.00, planPaid: 570.00, diagnosis: 'Annual physical examination' },
  { id: 'c002', memberId: 'm001', claimNumber: 'CLM-2024-0002', serviceDate: '2024-02-15', provider: 'Walgreens Pharmacy', serviceType: 'Pharmacy', status: 'Approved', billedAmount: 120.00, allowedAmount: 95.00, memberResponsibility: 20.00, planPaid: 75.00, diagnosis: 'Hypertension management' },
  { id: 'c003', memberId: 'm002', claimNumber: 'CLM-2024-0003', serviceDate: '2024-01-22', provider: 'Dallas Orthopedic Center', serviceType: 'Medical', status: 'In Review', billedAmount: 4200.00, allowedAmount: 3500.00, memberResponsibility: 700.00, planPaid: 2800.00, diagnosis: 'Knee MRI - right lateral meniscus' },
  { id: 'c004', memberId: 'm003', claimNumber: 'CLM-2024-0004', serviceDate: '2024-03-05', provider: 'SF Dental Associates', serviceType: 'Dental', status: 'Approved', billedAmount: 380.00, allowedAmount: 300.00, memberResponsibility: 60.00, planPaid: 240.00, diagnosis: 'Routine cleaning and X-rays' },
  { id: 'c005', memberId: 'm004', claimNumber: 'CLM-2024-0005', serviceDate: '2024-02-28', provider: 'Seton Medical Center', serviceType: 'Medical', status: 'Pending', billedAmount: 12500.00, allowedAmount: 10200.00, memberResponsibility: 2040.00, planPaid: 8160.00, diagnosis: 'Laparoscopic cholecystectomy' },
  { id: 'c006', memberId: 'm005', claimNumber: 'CLM-2024-0006', serviceDate: '2024-01-18', provider: 'Northwestern Memorial', serviceType: 'Mental Health', status: 'Approved', billedAmount: 650.00, allowedAmount: 550.00, memberResponsibility: 110.00, planPaid: 440.00, diagnosis: 'Cognitive behavioral therapy session' },
  { id: 'c007', memberId: 'm006', claimNumber: 'CLM-2024-0007', serviceDate: '2024-03-12', provider: 'LensCrafters Vision', serviceType: 'Vision', status: 'Approved', billedAmount: 280.00, allowedAmount: 200.00, memberResponsibility: 50.00, planPaid: 150.00, diagnosis: 'Annual eye exam and prescription update' },
  { id: 'c008', memberId: 'm007', claimNumber: 'CLM-2024-0008', serviceDate: '2024-02-07', provider: 'Houston Methodist Hospital', serviceType: 'Medical', status: 'Denied', billedAmount: 2800.00, allowedAmount: 0.00, memberResponsibility: 2800.00, planPaid: 0.00, diagnosis: 'Non-covered elective procedure' },
  { id: 'c009', memberId: 'm008', claimNumber: 'CLM-2024-0009', serviceDate: '2024-01-30', provider: 'CVS Pharmacy', serviceType: 'Pharmacy', status: 'Approved', billedAmount: 240.00, allowedAmount: 210.00, memberResponsibility: 42.00, planPaid: 168.00, diagnosis: 'Diabetes medication - insulin' },
  { id: 'c010', memberId: 'm010', claimNumber: 'CLM-2024-0010', serviceDate: '2024-03-20', provider: 'Rush University Medical', serviceType: 'Medical', status: 'In Review', billedAmount: 5600.00, allowedAmount: 4800.00, memberResponsibility: 960.00, planPaid: 3840.00, diagnosis: 'Cardiac stress test and echocardiogram' },
  { id: 'c011', memberId: 'm011', claimNumber: 'CLM-2024-0011', serviceDate: '2024-02-14', provider: 'Austin Periodontics', serviceType: 'Dental', status: 'Approved', billedAmount: 1800.00, allowedAmount: 1500.00, memberResponsibility: 300.00, planPaid: 1200.00, diagnosis: 'Periodontal scaling and root planing' },
  { id: 'c012', memberId: 'm012', claimNumber: 'CLM-2024-0012', serviceDate: '2024-01-05', provider: 'Grady Memorial Hospital', serviceType: 'Medical', status: 'Approved', billedAmount: 3200.00, allowedAmount: 2800.00, memberResponsibility: 560.00, planPaid: 2240.00, diagnosis: 'Emergency appendectomy' },
  { id: 'c013', memberId: 'm013', claimNumber: 'CLM-2024-0013', serviceDate: '2024-03-08', provider: 'Houston Eye Institute', serviceType: 'Vision', status: 'Pending', billedAmount: 450.00, allowedAmount: 380.00, memberResponsibility: 76.00, planPaid: 304.00, diagnosis: 'Glaucoma screening and treatment' },
  { id: 'c014', memberId: 'm014', claimNumber: 'CLM-2024-0014', serviceDate: '2024-02-20', provider: 'Baylor Scott & White', serviceType: 'Mental Health', status: 'Approved', billedAmount: 900.00, allowedAmount: 780.00, memberResponsibility: 156.00, planPaid: 624.00, diagnosis: 'Psychiatric evaluation and medication management' },
  { id: 'c015', memberId: 'm016', claimNumber: 'CLM-2024-0015', serviceDate: '2024-01-25', provider: 'UCSF Medical Center', serviceType: 'Medical', status: 'Approved', billedAmount: 680.00, allowedAmount: 580.00, memberResponsibility: 116.00, planPaid: 464.00, diagnosis: 'Annual wellness visit' },
  { id: 'c016', memberId: 'm017', claimNumber: 'CLM-2024-0016', serviceDate: '2024-03-15', provider: 'St. David\'s Medical Center', serviceType: 'Medical', status: 'In Review', billedAmount: 8900.00, allowedAmount: 7600.00, memberResponsibility: 1520.00, planPaid: 6080.00, diagnosis: 'Spinal fusion surgery - L4/L5' },
  { id: 'c017', memberId: 'm018', claimNumber: 'CLM-2024-0017', serviceDate: '2024-02-10', provider: 'RiteAid Pharmacy', serviceType: 'Pharmacy', status: 'Approved', billedAmount: 85.00, allowedAmount: 72.00, memberResponsibility: 15.00, planPaid: 57.00, diagnosis: 'Thyroid medication - levothyroxine' },
  { id: 'c018', memberId: 'm020', claimNumber: 'CLM-2024-0018', serviceDate: '2024-01-08', provider: 'Baylor University Medical', serviceType: 'Medical', status: 'Approved', billedAmount: 1450.00, allowedAmount: 1200.00, memberResponsibility: 240.00, planPaid: 960.00, diagnosis: 'OB/GYN prenatal care visit' },
  { id: 'c019', memberId: 'm004', claimNumber: 'CLM-2024-0019', serviceDate: '2024-03-25', provider: 'Austin Vision Center', serviceType: 'Vision', status: 'Approved', billedAmount: 320.00, allowedAmount: 260.00, memberResponsibility: 52.00, planPaid: 208.00, diagnosis: 'Contact lens fitting and prescription' },
  { id: 'c020', memberId: 'm008', claimNumber: 'CLM-2024-0020', serviceDate: '2024-02-03', provider: 'Dallas Dental Group', serviceType: 'Dental', status: 'Approved', billedAmount: 220.00, allowedAmount: 180.00, memberResponsibility: 36.00, planPaid: 144.00, diagnosis: 'Composite filling - two surfaces' },
  { id: 'c021', memberId: 'm002', claimNumber: 'CLM-2024-0021', serviceDate: '2024-03-18', provider: 'Walgreens Pharmacy', serviceType: 'Pharmacy', status: 'Pending', billedAmount: 340.00, allowedAmount: 290.00, memberResponsibility: 58.00, planPaid: 232.00, diagnosis: 'Specialty medication - biologics' },
  { id: 'c022', memberId: 'm007', claimNumber: 'CLM-2024-0022', serviceDate: '2024-01-14', provider: 'Houston Behavioral Health', serviceType: 'Mental Health', status: 'Approved', billedAmount: 750.00, allowedAmount: 640.00, memberResponsibility: 128.00, planPaid: 512.00, diagnosis: 'Individual therapy - anxiety disorder' },
  { id: 'c023', memberId: 'm011', claimNumber: 'CLM-2024-0023', serviceDate: '2024-02-26', provider: 'Texas Cardiovascular', serviceType: 'Medical', status: 'Denied', billedAmount: 3100.00, allowedAmount: 0.00, memberResponsibility: 3100.00, planPaid: 0.00, diagnosis: 'Prior authorization not obtained' },
  { id: 'c024', memberId: 'm014', claimNumber: 'CLM-2024-0024', serviceDate: '2024-03-01', provider: 'Dallas Orthopedic Center', serviceType: 'Medical', status: 'In Review', billedAmount: 6800.00, allowedAmount: 5700.00, memberResponsibility: 1140.00, planPaid: 4560.00, diagnosis: 'Total shoulder replacement' },
  { id: 'c025', memberId: 'm016', claimNumber: 'CLM-2024-0025', serviceDate: '2024-02-18', provider: 'SF Eye Associates', serviceType: 'Vision', status: 'Approved', billedAmount: 195.00, allowedAmount: 160.00, memberResponsibility: 32.00, planPaid: 128.00, diagnosis: 'Annual comprehensive eye exam' },
  { id: 'c026', memberId: 'm003', claimNumber: 'CLM-2024-0026', serviceDate: '2024-03-22', provider: 'CVS Pharmacy', serviceType: 'Pharmacy', status: 'Approved', billedAmount: 165.00, allowedAmount: 140.00, memberResponsibility: 28.00, planPaid: 112.00, diagnosis: 'Cholesterol medication - statin' },
  { id: 'c027', memberId: 'm010', claimNumber: 'CLM-2024-0027', serviceDate: '2024-01-19', provider: 'Rush Psychiatric Services', serviceType: 'Mental Health', status: 'Approved', billedAmount: 825.00, allowedAmount: 700.00, memberResponsibility: 140.00, planPaid: 560.00, diagnosis: 'Depression treatment - group therapy' },
  { id: 'c028', memberId: 'm017', claimNumber: 'CLM-2024-0028', serviceDate: '2024-02-08', provider: 'Austin Dental Spa', serviceType: 'Dental', status: 'Approved', billedAmount: 2800.00, allowedAmount: 2400.00, memberResponsibility: 480.00, planPaid: 1920.00, diagnosis: 'Crown placement - porcelain fused to metal' },
  { id: 'c029', memberId: 'm013', claimNumber: 'CLM-2024-0029', serviceDate: '2024-03-10', provider: 'Houston Methodist', serviceType: 'Medical', status: 'Pending', billedAmount: 1900.00, allowedAmount: 1600.00, memberResponsibility: 320.00, planPaid: 1280.00, diagnosis: 'Endoscopy - upper GI tract' },
  { id: 'c030', memberId: 'm020', claimNumber: 'CLM-2024-0030', serviceDate: '2024-03-28', provider: 'Baylor Maternity Center', serviceType: 'Medical', status: 'In Review', billedAmount: 18500.00, allowedAmount: 15800.00, memberResponsibility: 3160.00, planPaid: 12640.00, diagnosis: 'Vaginal delivery - uncomplicated' },
];

export const providers: Provider[] = [
  { id: 'p001', name: 'Dr. Sandra Cho, MD', specialty: 'Internal Medicine', npi: '1234567890', networkStatus: 'In-Network', address: '3801 N Lamar Blvd', city: 'Austin', state: 'TX', phone: '(512) 555-3001', acceptingPatients: true, rating: 4.8 },
  { id: 'p002', name: 'Dr. Kevin Park, MD', specialty: 'Family Medicine', npi: '2345678901', networkStatus: 'In-Network', address: '1901 Inwood Rd', city: 'Dallas', state: 'TX', phone: '(214) 555-3002', acceptingPatients: true, rating: 4.6 },
  { id: 'p003', name: 'Dr. Lisa Montoya, MD', specialty: 'Internal Medicine', npi: '3456789012', networkStatus: 'In-Network', address: '5501 S MoPac Expy', city: 'Austin', state: 'TX', phone: '(512) 555-3003', acceptingPatients: false, rating: 4.9 },
  { id: 'p004', name: 'Dr. James Okafor, MD', specialty: 'Cardiology', npi: '4567890123', networkStatus: 'In-Network', address: '6750 Bertner Ave', city: 'Houston', state: 'TX', phone: '(713) 555-3004', acceptingPatients: true, rating: 4.7 },
  { id: 'p005', name: 'Austin Regional Clinic', specialty: 'Multi-Specialty', npi: '5678901234', networkStatus: 'In-Network', address: '3828 S 2nd St', city: 'Austin', state: 'TX', phone: '(512) 555-3005', acceptingPatients: true, rating: 4.4 },
  { id: 'p006', name: 'Dallas Orthopedic Center', specialty: 'Orthopedic Surgery', npi: '6789012345', networkStatus: 'In-Network', address: '9301 N Central Expy', city: 'Dallas', state: 'TX', phone: '(214) 555-3006', acceptingPatients: true, rating: 4.5 },
  { id: 'p007', name: 'Northwestern Memorial Hospital', specialty: 'Hospital - General', npi: '7890123456', networkStatus: 'In-Network', address: '251 E Huron St', city: 'Chicago', state: 'IL', phone: '(312) 555-3007', acceptingPatients: true, rating: 4.8 },
  { id: 'p008', name: 'Houston Behavioral Health Institute', specialty: 'Psychiatry', npi: '8901234567', networkStatus: 'In-Network', address: '2801 Gessner Dr', city: 'Houston', state: 'TX', phone: '(713) 555-3008', acceptingPatients: true, rating: 4.3 },
  { id: 'p009', name: 'UCSF Medical Center', specialty: 'Hospital - Academic', npi: '9012345678', networkStatus: 'Out-of-Network', address: '505 Parnassus Ave', city: 'San Francisco', state: 'CA', phone: '(415) 555-3009', acceptingPatients: false, rating: 4.9 },
  { id: 'p010', name: 'Baylor Scott & White Health', specialty: 'Multi-Specialty', npi: '0123456789', networkStatus: 'In-Network', address: '2401 S 31st St', city: 'Temple', state: 'TX', phone: '(254) 555-3010', acceptingPatients: true, rating: 4.6 },
  { id: 'p011', name: 'Dr. Priya Anand, DDS', specialty: 'Dentistry', npi: '1122334455', networkStatus: 'In-Network', address: '4001 Westheimer Rd', city: 'Houston', state: 'TX', phone: '(713) 555-3011', acceptingPatients: true, rating: 4.7 },
  { id: 'p012', name: 'Rush University Medical Center', specialty: 'Hospital - Academic', npi: '2233445566', networkStatus: 'In-Network', address: '1620 W Harrison St', city: 'Chicago', state: 'IL', phone: '(312) 555-3012', acceptingPatients: true, rating: 4.8 },
  { id: 'p013', name: 'Texas Oncology - Austin', specialty: 'Oncology', npi: '3344556677', networkStatus: 'In-Network', address: '901 W 38th St', city: 'Austin', state: 'TX', phone: '(512) 555-3013', acceptingPatients: true, rating: 4.9 },
  { id: 'p014', name: 'Dr. Michelle Tran, OD', specialty: 'Optometry', npi: '4455667788', networkStatus: 'Out-of-Network', address: '123 Market St', city: 'San Francisco', state: 'CA', phone: '(415) 555-3014', acceptingPatients: false, rating: 4.2 },
  { id: 'p015', name: 'Seton Medical Center Austin', specialty: 'Hospital - General', npi: '5566778899', networkStatus: 'In-Network', address: '1201 W 38th St', city: 'Austin', state: 'TX', phone: '(512) 555-3015', acceptingPatients: true, rating: 4.5 },
];

export const careEpisodes: CareEpisode[] = [
  { id: 'e001', memberId: 'm004', title: 'Laparoscopic Cholecystectomy - Pre & Post-Op Care', status: 'In Progress', priority: 'High', assignedNavigator: 'Danielle Kees', createdDate: '2024-02-20', lastUpdated: '2024-03-25', category: 'Surgery', notes: 'Member scheduled for surgery on 2/28. Pre-op labs completed. Post-op follow-up appointments scheduled. Physical therapy referral pending.' },
  { id: 'e002', memberId: 'm001', title: 'Hypertension Management Program', status: 'Open', priority: 'Medium', assignedNavigator: 'Marcus Reid', createdDate: '2024-01-15', lastUpdated: '2024-03-10', category: 'Chronic', notes: 'Member enrolled in remote BP monitoring. Medication adherence coaching initiated. Target: BP below 130/80 within 90 days.' },
  { id: 'e003', memberId: 'm008', title: 'Type 2 Diabetes Care Coordination', status: 'In Progress', priority: 'High', assignedNavigator: 'Danielle Kees', createdDate: '2023-12-01', lastUpdated: '2024-03-28', category: 'Chronic', notes: 'A1c trending down from 8.2 to 7.4. Continuous glucose monitor ordered. Endocrinology referral completed. Nutritionist follow-up scheduled.' },
  { id: 'e004', memberId: 'm014', title: 'Total Shoulder Replacement - Surgical Support', status: 'Open', priority: 'Critical', assignedNavigator: 'Sarah Owens', createdDate: '2024-02-25', lastUpdated: '2024-03-26', category: 'Surgery', notes: 'COE evaluation in progress. Second opinion arranged at Baylor. Insurance authorization submitted. Expected surgery date Q2 2024.' },
  { id: 'e005', memberId: 'm017', title: 'Spinal Fusion Surgery Navigation', status: 'Escalated', priority: 'Critical', assignedNavigator: 'Danielle Kees', createdDate: '2024-03-01', lastUpdated: '2024-03-27', category: 'Surgery', notes: 'Escalated due to coverage dispute. Legal review requested. Member experiencing significant pain. Expedited review initiated with medical director.' },
  { id: 'e006', memberId: 'm005', title: 'Mental Health Support - Anxiety & Depression', status: 'In Progress', priority: 'Medium', assignedNavigator: 'Marcus Reid', createdDate: '2024-01-10', lastUpdated: '2024-03-20', category: 'Mental Health', notes: 'Member engaged in weekly CBT. PHQ-9 score improved from 14 to 9. Medication management coordinated with psychiatrist.' },
  { id: 'e007', memberId: 'm020', title: 'Maternity Care Program', status: 'In Progress', priority: 'High', assignedNavigator: 'Sarah Owens', createdDate: '2024-01-05', lastUpdated: '2024-03-29', category: 'Maternity', notes: 'Currently 36 weeks gestation. High-risk OB involved. Birth plan documented. Pediatrician selected. Hospital pre-registration complete.' },
  { id: 'e008', memberId: 'm002', title: 'Knee Injury Assessment and Treatment', status: 'Open', priority: 'Medium', assignedNavigator: 'Marcus Reid', createdDate: '2024-01-22', lastUpdated: '2024-03-15', category: 'General', notes: 'MRI results reviewed - partial meniscus tear. Conservative treatment initiated. Orthopedic surgeon consultation scheduled. PT started.' },
  { id: 'e009', memberId: 'm010', title: 'Cardiac Workup Follow-up', status: 'Resolved', priority: 'High', assignedNavigator: 'Danielle Kees', createdDate: '2024-03-20', lastUpdated: '2024-03-28', category: 'General', notes: 'Stress test results normal. Echocardiogram showed mild mitral regurgitation. Cardiologist follow-up in 6 months. No intervention required at this time.' },
  { id: 'e010', memberId: 'm007', title: 'Mental Health Crisis Intervention', status: 'Escalated', priority: 'Critical', assignedNavigator: 'Sarah Owens', createdDate: '2024-03-12', lastUpdated: '2024-03-29', category: 'Mental Health', notes: 'Member experienced acute anxiety episode. IOP program enrolled. Crisis hotline access provided. Weekly check-ins scheduled. Employer EAP coordinated.' },
];

export function getMemberById(id: string) { return members.find(m => m.id === id); }
export function getClaimsByMemberId(id: string) { return claims.filter(c => c.memberId === id); }
export function getCareEpisodesByMemberId(id: string) { return careEpisodes.filter(e => e.memberId === id); }
export function getMemberFullName(member: Member) { return `${member.firstName} ${member.lastName}`; }
