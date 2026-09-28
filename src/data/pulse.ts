/**
 * Live activity ("pulse") content: the notification pop-ups, the live count in the
 * lift picker, and the "Happening now" feed.
 *
 * TODO before launch: everything here is TEST DATA. The events, cities and counts
 * are generated in the browser and do not reflect real usage. Showing made-up
 * activity to real visitors is the kind of fake social proof the FTC's 2024 rule
 * targets. Replace the generator with real, anonymized calculation events (lift,
 * reps, region, time) from a backend, or set PULSE_DEMO to false to hide it all.
 */
export const PULSE_DEMO = true;

export type MarketCode = 'US' | 'CA' | 'GB' | 'IE' | 'AU' | 'NZ' | 'DE' | 'NL' | 'FR' | 'ES' | 'MX' | 'BR' | 'IN' | 'ZA';

export interface Market {
  /** Used in copy: "lifters in the US". */
  name: string;
  cities: readonly string[];
}

export const DEFAULT_MARKET: MarketCode = 'US';

export const MARKETS: Record<MarketCode, Market> = {
  US: {
    name: 'the US',
    cities: [
      'Austin, TX', 'Denver, CO', 'Columbus, OH', 'Phoenix, AZ', 'Atlanta, GA', 'Nashville, TN',
      'San Diego, CA', 'Sacramento, CA', 'Brooklyn, NY', 'Buffalo, NY', 'Chicago, IL', 'Tampa, FL',
      'Orlando, FL', 'Charlotte, NC', 'Raleigh, NC', 'Seattle, WA', 'Portland, OR', 'Boise, ID',
      'Salt Lake City, UT', 'Minneapolis, MN', 'Madison, WI', 'Kansas City, MO', 'Omaha, NE',
      'Dallas, TX', 'Houston, TX', 'Pittsburgh, PA', 'Boston, MA', 'Richmond, VA', 'Las Vegas, NV',
      'Albuquerque, NM', 'Tulsa, OK', 'Louisville, KY', 'Birmingham, AL', 'Anchorage, AK',
    ],
  },
  CA: {
    name: 'Canada',
    cities: ['Toronto, ON', 'Ottawa, ON', 'Hamilton, ON', 'Vancouver, BC', 'Victoria, BC', 'Calgary, AB', 'Edmonton, AB', 'Winnipeg, MB', 'Saskatoon, SK', 'Montréal, QC', 'Québec City, QC', 'Halifax, NS'],
  },
  GB: {
    name: 'the UK',
    cities: ['London', 'Manchester', 'Leeds', 'Birmingham', 'Bristol', 'Liverpool', 'Sheffield', 'Newcastle', 'Nottingham', 'Glasgow', 'Edinburgh', 'Cardiff', 'Belfast', 'Brighton'],
  },
  IE: {
    name: 'Ireland',
    cities: ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Kilkenny'],
  },
  AU: {
    name: 'Australia',
    cities: ['Sydney, NSW', 'Newcastle, NSW', 'Melbourne, VIC', 'Geelong, VIC', 'Brisbane, QLD', 'Gold Coast, QLD', 'Perth, WA', 'Adelaide, SA', 'Hobart, TAS', 'Canberra, ACT'],
  },
  NZ: {
    name: 'New Zealand',
    cities: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin'],
  },
  DE: {
    name: 'Germany',
    cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Leipzig', 'Dresden', 'Hanover'],
  },
  NL: {
    name: 'the Netherlands',
    cities: ['Amsterdam', 'Rotterdam', 'Utrecht', 'The Hague', 'Eindhoven', 'Groningen'],
  },
  FR: {
    name: 'France',
    cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Lille', 'Nantes', 'Nice'],
  },
  ES: {
    name: 'Spain',
    cities: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao', 'Málaga', 'Zaragoza'],
  },
  MX: {
    name: 'Mexico',
    cities: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'Mérida', 'Querétaro'],
  },
  BR: {
    name: 'Brazil',
    cities: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Porto Alegre', 'Brasília', 'Recife', 'Florianópolis'],
  },
  IN: {
    name: 'India',
    cities: ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur'],
  },
  ZA: {
    name: 'South Africa',
    cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein'],
  },
};

/**
 * Time zones that pin down a country better than the language tag does
 * (plenty of browsers everywhere report en-US).
 */
export const TIMEZONE_MARKETS: Record<string, MarketCode> = {
  'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US',
  'America/Phoenix': 'US', 'America/Anchorage': 'US', 'America/Detroit': 'US', 'America/Boise': 'US',
  'America/Indiana/Indianapolis': 'US', 'America/Kentucky/Louisville': 'US', 'Pacific/Honolulu': 'US',
  'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA', 'America/Winnipeg': 'CA',
  'America/Regina': 'CA', 'America/Halifax': 'CA', 'America/St_Johns': 'CA', 'America/Montreal': 'CA',
  'America/Mexico_City': 'MX', 'America/Monterrey': 'MX', 'America/Tijuana': 'MX', 'America/Cancun': 'MX',
  'America/Merida': 'MX', 'America/Chihuahua': 'MX', 'America/Hermosillo': 'MX', 'America/Mazatlan': 'MX',
  'America/Sao_Paulo': 'BR', 'America/Fortaleza': 'BR', 'America/Recife': 'BR', 'America/Bahia': 'BR',
  'America/Manaus': 'BR', 'America/Belem': 'BR',
  'Europe/London': 'GB', 'Europe/Belfast': 'GB', 'Europe/Dublin': 'IE',
  'Europe/Berlin': 'DE', 'Europe/Amsterdam': 'NL', 'Europe/Paris': 'FR', 'Europe/Madrid': 'ES',
  'Atlantic/Canary': 'ES', 'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
  'Africa/Johannesburg': 'ZA', 'Pacific/Auckland': 'NZ',
};

/** Short badge label for each lift in the notification. */
export const LIFT_BADGE: Record<string, string> = { Bench: 'BP', Squat: 'SQ', Deadlift: 'DL', Press: 'OHP' };

/**
 * Share of calculations per lift, used to split "maxes today" by lift and to pick
 * which lift an event is about.
 */
export const LIFT_SHARE: Record<string, number> = { Bench: 0.38, Squat: 0.27, Deadlift: 0.22, Press: 0.13 };

/** Values a notification template can use. Counts arrive pre-formatted ("1,204"). */
export interface PulseCtx {
  city: string;
  country: string;
  /** Lift label in running text: "bench", "overhead press". */
  lift: string;
  reps: number;
  hereNow: string;
  lastHour: string;
  liftToday: string;
}

export interface PulseTemplate {
  /** Pins the template to one lift. */
  lift?: 'Bench' | 'Squat' | 'Deadlift' | 'Press';
  /** Limits the rep count, inclusive. */
  reps?: [number, number];
  /** Count-style messages show "Updated just now" instead of a time ago. */
  count?: boolean;
  /** Badge override; defaults to the lift abbreviation over the rep count. */
  badge?: (c: PulseCtx) => [string, string];
  /** Bold opening, then the rest of the sentence. */
  lead: (c: PulseCtx) => string;
  rest: (c: PulseCtx) => string;
}

/** Notification messages. Order is shuffled per visit. */
export const PULSE_TEMPLATES: readonly PulseTemplate[] = [
  { lead: (c) => `A lifter in ${c.city}`, rest: (c) => `just found their ${c.lift} max` },
  { lead: (c) => `Someone in ${c.city}`, rest: (c) => `estimated a ${c.lift} max from a set of ${c.reps}` },
  { lead: (c) => `A lifter in ${c.city}`, rest: (c) => `hit a new ${c.lift} max estimate` },
  { reps: [2, 10], lead: (c) => `${c.city}:`, rest: (c) => `a ${c.reps}-rep ${c.lift} set just became a one-rep max` },
  { lead: (c) => `A lifter in ${c.city}`, rest: (c) => `pulled up training weights for their ${c.lift}` },
  { lead: (c) => `A coach in ${c.city}`, rest: (c) => `just calculated a ${c.lift} max for a client` },
  { lead: (c) => `Someone in ${c.city}`, rest: (c) => `compared their ${c.lift} max with lifters their age` },
  { lead: (c) => `A lifter in ${c.city}`, rest: (c) => `shared their ${c.lift} max card` },
  { count: true, badge: (c) => [c.lastHour, 'LAST HR'], lead: (c) => `${c.lastHour} lifters in ${c.country}`, rest: () => 'found a max in the last hour' },
  { count: true, badge: (c) => [c.liftToday, 'TODAY'], lead: (c) => `${c.liftToday} ${c.lift} maxes`, rest: () => 'calculated today' },
  { lift: 'Squat', lead: (c) => `A powerlifter in ${c.city}`, rest: () => 'just planned meet openers from their squat max' },
  { lead: (c) => `A lifter in ${c.city}`, rest: (c) => `found their ${c.lift} max with 2 reps left in the tank` },
  { lead: (c) => `A lifter in ${c.city}`, rest: (c) => `came back to update their ${c.lift} max` },
  { badge: () => ['4', 'LIFTS'], lead: (c) => `Someone in ${c.city}`, rest: () => 'checked their max on all four lifts' },
  { lead: (c) => `Someone near ${c.city}`, rest: (c) => `got their ${c.lift} max in under 30 seconds` },
  { lead: (c) => `A lifter in ${c.city}`, rest: (c) => `ranked their ${c.lift} against lifters their bodyweight` },
  { count: true, badge: (c) => [c.hereNow, 'NOW'], lead: (c) => `${c.hereNow} lifters`, rest: () => 'are on the calculator right now' },
  { reps: [2, 6], lead: (c) => `A lifter in ${c.city}`, rest: (c) => `used a ${c.reps}-rep set, the most accurate range` },
  { lead: (c) => `A masters lifter in ${c.city}`, rest: (c) => `just found their ${c.lift} max` },
  { lead: (c) => `A college athlete in ${c.city}`, rest: (c) => `just found their ${c.lift} max` },
  { lead: (c) => `A lifter in ${c.city}`, rest: (c) => `saved their ${c.lift} percentages for next week` },
  { count: true, lift: 'Bench', badge: () => ['#1', 'TODAY'], lead: () => 'Bench press', rest: (c) => `is the most calculated lift in ${c.country} today` },
  { lift: 'Deadlift', lead: (c) => `A lifter in ${c.city}`, rest: (c) => `turned a ${c.reps}-rep deadlift into a one-rep max` },
  { lift: 'Press', lead: (c) => `Someone in ${c.city}`, rest: () => 'found their overhead press max' },
];
