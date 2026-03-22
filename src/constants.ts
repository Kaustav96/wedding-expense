export const APP_NAME = 'BandBajaBudget'

export const SIDES = ['bride', 'groom'] as const

export const FAMILY_MEMBERS = [
  {
    id: 'himasree',
    name: 'Himasree Dam',
    email: 'himasree@bandbajabudget.com',
    defaultPassword: 'Test@123',
    side: 'bride',
  },
  {
    id: 'pinki',
    name: 'Pinki Dam',
    email: 'pinki@bandbajabudget.com',
    defaultPassword: 'Test@123',
    side: 'bride',
  },
  {
    id: 'himadree',
    name: 'Himadree Dam',
    email: 'himadree@bandbajabudget.com',
    defaultPassword: 'Test@123',
    side: 'bride',
  },
  {
    id: 'krishnendu',
    name: 'Krishnendu Banerjee',
    email: 'kb@bandbajabudget.com',
    defaultPassword: 'Test@123',
    side: 'groom',
  },
  {
    id: 'anshu',
    name: 'Anshu Banerjee',
    email: 'anshu@bandbajabudget.com',
    defaultPassword: 'Test@123',
    side: 'groom',
  },
  {
    id: 'kaustav',
    name: 'Kaustav Banerjee',
    email: 'kaustav@bandbajabudget.com',
    defaultPassword: 'Test@123',
    side: 'groom',
  },
] as const

export const ALLOWED_EMAILS: string[] = FAMILY_MEMBERS.map((member) => member.email)

export const EXPENSE_CATEGORIES = [
  'Catering',
  'Gold',
  'Decor',
  'Venue',
  'Photography',
  'Travel',
  'Clothing',
  'Gifts',
  'Miscellaneous',
] as const

export const DEFAULT_BUDGET = 2500000

export const DEFAULT_SIDE_BUDGET = 0

export const DEFAULT_PASSWORD_BY_EMAIL: Record<string, string> = FAMILY_MEMBERS.reduce(
  (acc, member) => {
    if ('defaultPassword' in member) {
      acc[member.email] = member.defaultPassword
    }
    return acc
  },
  {} as Record<string, string>,
)

