import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'km';

interface Translations {
  [key: string]: {
    en: string;
    km: string;
  };
}

// Comprehensive translations
export const translations: Translations = {
  // Navbar
  'nav.services': { en: 'Services', km: 'សេវាកម្ម' },
  'nav.features': { en: 'Features', km: 'លក្ខណៈពិសេស' },
  'nav.pricing': { en: 'Pricing', km: 'តម្លៃ' },
  'nav.locations': { en: 'Locations', km: 'ទីតាំង' },
  'nav.getStarted': { en: 'Get Started', km: 'ចាប់ផ្តើម' },
  
  // Hero
  'hero.badge': { en: 'Your Brand • Your Message • Your Values', km: 'ម៉ាកយីហោរបស់អ្នក • សារលិខិតរបស់អ្នក • គុណតម្លៃរបស់អ្នក' },
  'hero.learnMore': { en: 'Learn More', km: 'ស្វែងយល់បន្ថែម' },
  'hero.satisfactionGuaranteed': { en: 'Satisfaction Guaranteed', km: 'ការធានាការពេញចិត្ត' },
  'hero.tryRiskFree': { en: 'Try risk-free with our money-back guarantee.', km: 'សាកល្បងដោយគ្មានហានិភ័យជាមួយការធានាប្រាក់កិនវិញ។' },
  
  // Games Section
  'games.subtitle': { en: 'Our Services', km: 'សេវាកម្មរបស់យើង' },
  'games.title': { en: 'What We', km: 'អ្វីដែលយើង' },
  'games.titleHighlight': { en: 'Offer', km: 'ផ្តល់ជូន' },
  'games.description': { en: 'Customize this section with your own services or products.', km: 'ប្ដូរផ្នែកនេះតាមបំណងជាមួយសេវាកម្ម ឬផលិតផលរបស់អ្នក។' },
  'games.viewPlans': { en: 'View Plans', km: 'មើលគម្រោង' },
  'games.from': { en: 'From', km: 'ចាប់ពី' },
  'games.plans': { en: 'plans', km: 'គម្រោង' },
  'games.cantFind': { en: "Can't find what you're looking for?", km: 'រកមិនឃើញអ្វីដែលអ្នកកំពុងស្វែងរក?' },
  'games.contactUs': { en: 'Contact Us for Custom Solutions', km: 'ទាក់ទងយើងសម្រាប់ដំណោះស្រាយផ្ទាល់ខ្លួន' },
  
  // Pricing Section
  'pricing.subtitle': { en: 'Pricing', km: 'តម្លៃ' },
  'pricing.title': { en: 'Simple', km: 'សាមញ្ញ' },
  'pricing.titleHighlight': { en: 'Pricing', km: 'តម្លៃ' },
  'pricing.description': { en: 'Transparent pricing with no hidden fees.', km: 'តម្លៃថ្លៃថ្នូរគ្មានថ្លៃលាក់។' },
  'pricing.mostPopular': { en: 'Most Popular', km: 'ពេញនិយមបំផុត' },
  'pricing.month': { en: '/month', km: '/ខែ' },
  'pricing.orderNow': { en: 'Order Now', km: 'បញ្ជាទិញឥឡូវ' },
  'pricing.comingSoon': { en: 'Coming Soon', km: 'មកដល់ឆាប់ៗ' },
  'pricing.guarantee': { en: '30-day money-back guarantee • Cancel anytime • No hidden fees', km: 'ធានាប្រាក់កិនវិញ ៣០ ថ្ងៃ • បោះបង់គ្រប់ពេល • គ្មានថ្លៃលាក់' },
  'pricing.ram': { en: 'RAM', km: 'រ៉ែម' },
  'pricing.cpu': { en: 'CPU', km: 'ស៊ីភីយូ' },
  'pricing.storage': { en: 'Storage', km: 'ទំហំផ្ទុក' },
  'pricing.slots': { en: 'Slots', km: 'រន្ធ' },
  
  // Features
  'features.subtitle': { en: 'Why Choose Us', km: 'ហេតុអ្វីជ្រើសរើសយើង' },
  'features.title': { en: 'Enterprise', km: 'សហគ្រាស' },
  'features.titleHighlight': { en: 'Hardware', km: 'ផ្នែករឹង' },
  'features.description': { en: 'Built on premium infrastructure for maximum performance.', km: 'បង្កើតលើហេដ្ឋារចនាសម្ព័ន្ធប្រណិតសម្រាប់ដំណើរការអតិបរមា។' },
  
  // Locations
  'locations.subtitle': { en: 'Global Network', km: 'បណ្ដាញសកល' },
  'locations.title': { en: 'Server', km: 'ម៉ាស៊ីនមេ' },
  'locations.titleHighlight': { en: 'Locations', km: 'ទីតាំង' },
  'locations.description': { en: 'Choose from multiple data centers worldwide.', km: 'ជ្រើសរើសពីមជ្ឈមណ្ឌលទិន្នន័យជាច្រើនទូទាំងពិភពលោក។' },
  
  // Footer
  'footer.rights': { en: 'All rights reserved.', km: 'រក្សាសិទ្ធិគ្រប់យ៉ាង។' },
  'footer.privacy': { en: 'Privacy Policy', km: 'គោលការណ៍ឯកជន' },
  'footer.terms': { en: 'Terms of Service', km: 'លក្ខខណ្ឌសេវាកម្ម' },
  'footer.contact': { en: 'Contact', km: 'ទំនាក់ទំនង' },
  'footer.product': { en: 'Product', km: 'ផលិតផល' },
  'footer.company': { en: 'Company', km: 'ក្រុមហ៊ុន' },
  'footer.legal': { en: 'Legal', km: 'ច្បាប់' },
  
  // About Page
  'about.title': { en: 'About', km: 'អំពី' },
  'about.description': { en: "We're passionate about providing the best game server hosting experience for gamers worldwide.", km: 'យើងមានចំណង់ចំណូលចិត្តក្នុងការផ្តល់បទពិសោធន៍បង្ហោះម៉ាស៊ីនមេល្បែងល្អបំផុតសម្រាប់អ្នកលេងល្បែងទូទាំងពិភពលោក។' },
  'about.communityFirst': { en: 'Community First', km: 'សហគមន៍មកមុន' },
  'about.communityDesc': { en: 'Building a strong gaming community is at our core.', km: 'ការកសាងសហគមន៍ហ្គេមដ៏រឹងមាំគឺជាស្នូលរបស់យើង។' },
  'about.performance': { en: 'Performance', km: 'ដំណើរការ' },
  'about.performanceDesc': { en: 'Optimized servers for the best gaming experience.', km: 'ម៉ាស៊ីនមេដែលបានធ្វើឱ្យប្រសើរសម្រាប់បទពិសោធន៍ហ្គេមល្អបំផុត។' },
  'about.quality': { en: 'Quality', km: 'គុណភាព' },
  'about.qualityDesc': { en: 'Enterprise-grade infrastructure you can rely on.', km: 'ហេដ្ឋារចនាសម្ព័ន្ធកម្រិតសហគ្រាសដែលអ្នកអាចពឹងផ្អែកបាន។' },
  'about.support': { en: 'Support', km: 'ជំនួយ' },
  'about.supportDesc': { en: '24/7 dedicated support for all our customers.', km: 'ជំនួយ ២៤/៧ សម្រាប់អតិថិជនទាំងអស់របស់យើង។' },
  'about.ourStory': { en: 'Our Story', km: 'រឿងរ៉ាវរបស់យើង' },
  
  // Blog Page
  'blog.title': { en: 'Blog', km: 'ប្លុក' },
  'blog.description': { en: 'News, tutorials, and updates from our team.', km: 'ព័ត៌មាន ការបង្រៀន និងព័ត៌មានថ្មីៗពីក្រុមរបស់យើង។' },
  
  // Careers Page
  'careers.title': { en: 'Join', km: 'ចូលរួម' },
  'careers.description': { en: 'Help us build the future of game server hosting.', km: 'ជួយយើងកសាងអនាគតនៃការបង្ហោះម៉ាស៊ីនមេល្បែង។' },
  'careers.applyNow': { en: 'Apply Now', km: 'ដាក់ពាក្យឥឡូវ' },
  'careers.remote': { en: 'Remote', km: 'ពីចម្ងាយ' },
  'careers.fullTime': { en: 'Full-time', km: 'ពេញម៉ោង' },
  'careers.noPositions': { en: 'No open positions at the moment. Check back later!', km: 'មិនមានមុខតំណែងទំនេរនៅពេលនេះទេ។ សូមពិនិត្យមើលម្តងទៀតនៅពេលក្រោយ!' },
  
  // Contact Page
  'contact.title': { en: 'Contact', km: 'ទំនាក់ទំនង' },
  'contact.us': { en: 'Us', km: 'យើង' },
  'contact.description': { en: "Have questions? We'd love to hear from you.", km: 'មានសំណួរ? យើងចង់ស្តាប់ពីអ្នក។' },
  'contact.email': { en: 'Email', km: 'អ៊ីមែល' },
  'contact.liveChat': { en: 'Live Chat', km: 'ជជែកផ្ទាល់' },
  'contact.liveChatDesc': { en: 'Available 24/7 for all customers', km: 'មាន ២៤/៧ សម្រាប់អតិថិជនទាំងអស់' },
  'contact.office': { en: 'Office', km: 'ការិយាល័យ' },
  'contact.remoteFirst': { en: 'Remote-first company', km: 'ក្រុមហ៊ុនពីចម្ងាយមុន' },
  'contact.sendMessage': { en: 'Send a Message', km: 'ផ្ញើសារ' },
  'contact.name': { en: 'Name', km: 'ឈ្មោះ' },
  'contact.yourName': { en: 'Your name', km: 'ឈ្មោះរបស់អ្នក' },
  'contact.yourEmail': { en: 'your@email.com', km: 'អ៊ីមែលរបស់អ្នក' },
  'contact.message': { en: 'Message', km: 'សារ' },
  'contact.yourMessage': { en: 'Your message...', km: 'សាររបស់អ្នក...' },
  'contact.send': { en: 'Send Message', km: 'ផ្ញើសារ' },
  
  // Privacy Page
  'privacy.title': { en: 'Privacy Policy', km: 'គោលការណ៍ឯកជន' },
  'privacy.lastUpdated': { en: 'Last updated', km: 'ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ' },
  'privacy.infoCollect': { en: '1. Information We Collect', km: '១. ព័ត៌មានដែលយើងប្រមូល' },
  'privacy.howUse': { en: '2. How We Use Your Information', km: '២. របៀបដែលយើងប្រើប្រាស់ព័ org មានរបស់អ្នក' },
  'privacy.dataSecurity': { en: '3. Data Security', km: '៣. សុវត្ថិភាពទិន្នន័យ' },
  'privacy.contactUs': { en: '4. Contact Us', km: '៤. ទាក់ទងយើង' },
  
  // Terms Page
  'terms.title': { en: 'Terms of Service', km: 'លក្ខខណ្ឌសេវាកម្ម' },
  'terms.acceptance': { en: '1. Acceptance of Terms', km: '១. ការទទួលយកលក្ខខណ្ឌ' },
  'terms.useServices': { en: '2. Use of Services', km: '២. ការប្រើប្រាស់សេវាកម្ម' },
  'terms.accountResponsibility': { en: '3. Account Responsibility', km: '៣. ទំនួលខុសត្រូវគណនី' },
  'terms.serviceAvailability': { en: '4. Service Availability', km: '៤. ភាពអាចរកបានសេវាកម្ម' },
  'terms.contact': { en: '5. Contact', km: '៥. ទំនាក់ទំនង' },
  
  // SLA Page
  'sla.title': { en: 'Service Level Agreement', km: 'កិច្ចព្រមព្រៀងកម្រិតសេវាកម្ម' },
  'sla.uptimeGuarantee': { en: 'Uptime Guarantee', km: 'ការធានាពេលវេលាដំណើរការ' },
  'sla.monthlyUptime': { en: 'Monthly uptime commitment', km: 'ការប្តេជ្ញាចិត្តពេលវេលាដំណើរការប្រចាំខែ' },
  'sla.serviceCredits': { en: 'Service Credits', km: 'ឥណទានសេវាកម្ម' },
  'sla.responseTime': { en: 'Support Response Times', km: 'ពេលវេលាឆ្លើយតបជំនួយ' },
  'sla.exclusions': { en: 'Exclusions', km: 'ការដកចេញ' },
  
  // GDPR Page
  'gdpr.title': { en: 'GDPR Compliance', km: 'ការអនុលោមតាម GDPR' },
  'gdpr.description': { en: 'is committed to protecting your privacy and complying with the General Data Protection Regulation (GDPR).', km: 'ប្តេជ្ញាការពារឯកជនភាពរបស់អ្នក និងអនុលោមតាមបទប្បញ្ញត្តិការពារទិន្នន័យទូទៅ (GDPR)។' },
  'gdpr.rightAccess': { en: 'Right to Access', km: 'សិទ្ធិចូលប្រើ' },
  'gdpr.rightAccessDesc': { en: 'Request a copy of your personal data we hold.', km: 'ស្នើសុំច្បាប់ចម្លងនៃទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នកដែលយើងកាន់។' },
  'gdpr.rightRectification': { en: 'Right to Rectification', km: 'សិទ្ធិកែតម្រូវ' },
  'gdpr.rightRectificationDesc': { en: 'Request correction of inaccurate personal data.', km: 'ស្នើសុំកែតម្រូវទិន្នន័យផ្ទាល់ខ្លួនមិនត្រឹមត្រូវ។' },
  'gdpr.rightErasure': { en: 'Right to Erasure', km: 'សិទ្ធិលុប' },
  'gdpr.rightErasureDesc': { en: 'Request deletion of your personal data.', km: 'ស្នើសុំលុបទិន្នន័យផ្ទាល់ខ្លួនរបស់អ្នក។' },
  'gdpr.rightRestrict': { en: 'Right to Restrict', km: 'សិទ្ធិដាក់កំហិត' },
  'gdpr.rightRestrictDesc': { en: 'Request restriction of processing your data.', km: 'ស្នើសុំកំហិតការដំណើរការទិន្នន័យរបស់អ្នក។' },
  'gdpr.dataProcessing': { en: 'Data Processing', km: 'ដំណើរការទិន្នន័យ' },
  'gdpr.dpo': { en: 'Data Protection Officer', km: 'មន្រ្តីការពារទិន្នន័យ' },
  'gdpr.exerciseRights': { en: 'Exercise Your Rights', km: 'អនុវត្តសិទ្ធិរបស់អ្នក' },
  'gdpr.submitRequest': { en: 'Submit Data Request', km: 'ដាក់ស្នើសុំទិន្នន័យ' },
  
  // Common
  'common.loading': { en: 'Loading...', km: 'កំពុងផ្ទុក...' },
  'common.january': { en: 'January', km: 'មករា' },
  'common.save': { en: 'Save', km: 'រក្សាទុក' },
  'common.cancel': { en: 'Cancel', km: 'បោះបង់' },
  'common.delete': { en: 'Delete', km: 'លុប' },
  'common.edit': { en: 'Edit', km: 'កែប្រែ' },
  'common.view': { en: 'View', km: 'មើល' },
  'common.back': { en: 'Back', km: 'ត្រឡប់' },
  'common.next': { en: 'Next', km: 'បន្ទាប់' },
  'common.previous': { en: 'Previous', km: 'មុន' },
  'common.search': { en: 'Search', km: 'ស្វែងរក' },
  'common.filter': { en: 'Filter', km: 'ច្រោះ' },
  'common.actions': { en: 'Actions', km: 'សកម្មភាព' },
  'common.status': { en: 'Status', km: 'ស្ថានភាព' },
  'common.active': { en: 'Active', km: 'សកម្ម' },
  'common.inactive': { en: 'Inactive', km: 'អសកម្ម' },
  'common.pending': { en: 'Pending', km: 'រង់ចាំ' },
  'common.paid': { en: 'Paid', km: 'បានបង់' },
  'common.unpaid': { en: 'Unpaid', km: 'មិនទាន់បង់' },
  'common.cancelled': { en: 'Cancelled', km: 'បានបោះបង់' },
  'common.suspended': { en: 'Suspended', km: 'ព្យួរ' },
  'common.expired': { en: 'Expired', km: 'ផុតកំណត់' },

  // Game Names (Khmer translations)
  'game.minecraft': { en: 'Minecraft', km: 'ម៉ាញក្រាហ្វ' },
  'game.fivem': { en: 'FiveM', km: 'ហ្វាយវ៍អឹម' },
  'game.ark': { en: 'ARK: Survival', km: 'អាក: ការរស់រានមានជីវិត' },
  'game.samp': { en: 'SA-MP', km: 'អេសអេ-អឹមភី' },
  'game.discord': { en: 'Discord Bot', km: 'បូតឌីសខត' },
  'game.limbo': { en: 'Limbo', km: 'លីមបូ' },

  // Plan Details
  'plan.basic': { en: 'Basic', km: 'មូលដ្ឋាន' },
  'plan.standard': { en: 'Standard', km: 'ស្តង់ដារ' },
  'plan.premium': { en: 'Premium', km: 'ប្រណិត' },
  'plan.enterprise': { en: 'Enterprise', km: 'សហគ្រាស' },
  'plan.unlimited': { en: 'Unlimited', km: 'គ្មានដែនកំណត់' },
  'plan.players': { en: 'Players', km: 'អ្នកលេង' },
  'plan.members': { en: 'Members', km: 'សមាជិក' },
  'plan.bots': { en: 'Bots', km: 'បូត' },

  // Billing / Client Area
  'billing.dashboard': { en: 'Dashboard', km: 'ផ្ទាំងគ្រប់គ្រង' },
  'billing.services': { en: 'My Services', km: 'សេវាកម្មរបស់ខ្ញុំ' },
  'billing.invoices': { en: 'Invoices', km: 'វិក្កយបត្រ' },
  'billing.tickets': { en: 'Support Tickets', km: 'សំបុត្រជំនួយ' },
  'billing.account': { en: 'Account', km: 'គណនី' },
  'billing.profile': { en: 'Profile', km: 'ប្រវត្តិរូប' },
  'billing.settings': { en: 'Settings', km: 'ការកំណត់' },
  'billing.logout': { en: 'Logout', km: 'ចាកចេញ' },
  'billing.login': { en: 'Login', km: 'ចូល' },
  'billing.register': { en: 'Register', km: 'ចុះឈ្មោះ' },
  'billing.createTicket': { en: 'Create Ticket', km: 'បង្កើតសំបុត្រ' },
  'billing.viewInvoice': { en: 'View Invoice', km: 'មើលវិក្កយបត្រ' },
  'billing.payNow': { en: 'Pay Now', km: 'បង់ឥឡូវ' },
  'billing.dueDate': { en: 'Due Date', km: 'កាលបរិច្ឆេទផុតកំណត់' },
  'billing.amount': { en: 'Amount', km: 'ចំនួនទឹកប្រាក់' },
  'billing.total': { en: 'Total', km: 'សរុប' },
  'billing.subtotal': { en: 'Subtotal', km: 'សរុបរង' },
  'billing.tax': { en: 'Tax', km: 'ពន្ធ' },
  'billing.discount': { en: 'Discount', km: 'បញ្ចុះតម្លៃ' },
  'billing.orderNow': { en: 'Order Now', km: 'បញ្ជាទិញឥឡូវ' },
  'billing.renewNow': { en: 'Renew Now', km: 'បន្តឥឡូវ' },
  'billing.manageService': { en: 'Manage Service', km: 'គ្រប់គ្រងសេវាកម្ម' },
  'billing.serverDetails': { en: 'Server Details', km: 'ព័ត៌មានលម្អិតម៉ាស៊ីនមេ' },
  'billing.billingCycle': { en: 'Billing Cycle', km: 'វដ្តនៃការចេញវិក្កយបត្រ' },
  'billing.monthly': { en: 'Monthly', km: 'ប្រចាំខែ' },
  'billing.quarterly': { en: 'Quarterly', km: 'ប្រចាំត្រីមាស' },
  'billing.annually': { en: 'Annually', km: 'ប្រចាំឆ្នាំ' },
  'billing.nextDueDate': { en: 'Next Due Date', km: 'កាលបរិច្ឆេទផុតកំណត់បន្ទាប់' },
  'billing.welcomeBack': { en: 'Welcome back', km: 'សូមស្វាគមន៍ការត្រឡប់មកវិញ' },
  'billing.noServices': { en: 'No active services', km: 'គ្មានសេវាកម្មសកម្ម' },
  'billing.noInvoices': { en: 'No invoices found', km: 'រកមិនឃើញវិក្កយបត្រ' },
  'billing.noTickets': { en: 'No tickets found', km: 'រកមិនឃើញសំបុត្រ' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.en || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
