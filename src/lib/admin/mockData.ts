export type PaymentStatus = "Success" | "Pending" | "Failed";

export interface Payment {
  id: string;
  user: string;
  userId: string;
  method: string;
  amount: string;
  amountRaw: number;
  status: PaymentStatus;
  date: string;
  timeAgo: string;
  fee: string;
  campaign: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  status: "Active" | "Inactive";
  totalPayments: number;
  totalSpent: string;
  avatar: string;
}

export const payments: Payment[] = [
  {
    id: "PAY-1092",
    user: "John Doe",
    userId: "USR-001",
    method: "Credit Card",
    amount: "$60.00",
    amountRaw: 60,
    status: "Success",
    date: "Jan 17, 2026, 20:12",
    timeAgo: "23 min ago",
    fee: "$1.20",
    campaign: "Summer Giveaway",
  },
  {
    id: "PAY-1093",
    user: "Jane Smith",
    userId: "USR-002",
    method: "Apple Pay",
    amount: "$120.00",
    amountRaw: 120,
    status: "Pending",
    date: "Jan 17, 2026, 18:45",
    timeAgo: "2 hr ago",
    fee: "$2.40",
    campaign: "VIP Entry",
  },
  {
    id: "PAY-1094",
    user: "Bob Wilson",
    userId: "USR-003",
    method: "Credit Card",
    amount: "$60.00",
    amountRaw: 60,
    status: "Success",
    date: "Jan 16, 2026, 14:30",
    timeAgo: "1 day ago",
    fee: "$1.20",
    campaign: "Summer Giveaway",
  },
  {
    id: "PAY-1095",
    user: "Alice Brown",
    userId: "USR-004",
    method: "PayPal",
    amount: "$60.00",
    amountRaw: 60,
    status: "Failed",
    date: "Jan 16, 2026, 09:15",
    timeAgo: "1 day ago",
    fee: "$0.00",
    campaign: "Summer Giveaway",
  },
  {
    id: "PAY-1096",
    user: "Charlie Davis",
    userId: "USR-005",
    method: "Google Pay",
    amount: "$240.00",
    amountRaw: 240,
    status: "Success",
    date: "Jan 15, 2026, 11:00",
    timeAgo: "2 days ago",
    fee: "$4.80",
    campaign: "Mega Bundle",
  },
];

export const users: User[] = [
  {
    id: "USR-001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1 (555) 123-4567",
    joinDate: "Jan 10, 2026",
    status: "Active",
    totalPayments: 3,
    totalSpent: "$180.00",
    avatar: "JD",
  },
  {
    id: "USR-002",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+1 (555) 987-6543",
    joinDate: "Jan 12, 2026",
    status: "Active",
    totalPayments: 5,
    totalSpent: "$420.00",
    avatar: "JS",
  },
  {
    id: "USR-003",
    name: "Bob Wilson",
    email: "bob@example.com",
    phone: "+1 (555) 555-5555",
    joinDate: "Jan 15, 2026",
    status: "Inactive",
    totalPayments: 1,
    totalSpent: "$60.00",
    avatar: "BW",
  },
  {
    id: "USR-004",
    name: "Alice Brown",
    email: "alice@example.com",
    phone: "+1 (555) 111-2222",
    joinDate: "Jan 16, 2026",
    status: "Active",
    totalPayments: 2,
    totalSpent: "$120.00",
    avatar: "AB",
  },
  {
    id: "USR-005",
    name: "Charlie Davis",
    email: "charlie@example.com",
    phone: "+1 (555) 333-4444",
    joinDate: "Jan 17, 2026",
    status: "Active",
    totalPayments: 4,
    totalSpent: "$360.00",
    avatar: "CD",
  },
];
