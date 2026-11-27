/**
 * The demo data of the app screenshots (apps/web/scripts/screenshots/data.mjs): conversations,
 * questions, answers, documents and passages, the same as in apps/landing/public/screenshots.
 * Times are shown as the screenshots show them. UI texts never come from here, only content.
 */
export const CHATS = [
  { title: "Who may certify batch release?", time: "07:34", favourite: true, preview: "Before a batch is released, the system must make changes visible and keep the records safe:" },
  { title: "What does ICH Q9 say about risk review?", time: "06:56", preview: "Risk management should be an ongoing part of the quality management process, and its results reviewed." },
  { title: "How often must back-ups be checked?", time: "Sun", preview: "Integrity and accuracy of back-up data and the ability to restore it are checked during validation and monitored periodically." },
  { title: "Who should review audit trails?", time: "Sat", favourite: true, preview: "Personnel responsible for record review under CGMP review the audit trails along with the rest of the record." },
  { title: "Which records does Part 11 apply to?", time: "Thu", preview: "Records required by predicate rules and kept in electronic format instead of paper." },
  { title: "What are the two principles of quality risk management?", time: "Tue", preview: "Risk evaluation based on scientific knowledge and linked to patient protection; effort proportional to the risk." },
  { title: "Is a second check needed for manual data entry?", time: "Nov 11", preview: "Yes: critical data entered by hand needs an additional accuracy check." },
  { title: "Recipe for pancakes", time: "Nov 3", preview: "No answer yet" },
];

export const GROUP = { name: "GMP", conversations: 4, documents: 3 };
export const GROUP_CHATS = [CHATS[0], CHATS[1], CHATS[3], CHATS[6]];
export const DOCUMENTS = ["eu-gmp-annex11.pdf", "fda-data-integrity-qa.pdf", "fda-part11-scope.pdf", "ich-q9-r1.pdf"];

export const QUESTION_1 = "Who may certify batch release in a computerised system?";
export const ANSWER_1 = "Only a Qualified Person may certify the release of a batch, and the system has to identify and record who did it, with an electronic signature [1].";
export const QUESTION_2 = "What else has to be in place before a batch is released, and how are the records protected?";
export const ANSWER_2 =
  "Before a batch is released, the system must make changes visible and keep the records safe:\n\n1. Records that support batch release can be printed in a way that shows whether any data changed since it was entered [2].\n2. A risk assessment decides whether the system keeps an audit trail of every GMP-relevant change and deletion, with the reason for it [3].\n3. Data is protected against damage and checked for accessibility, readability and accuracy throughout the retention period [4].\n\nBack-ups are taken regularly, and restoring them is checked during validation and monitored periodically [5].";

export const SEARCH_QUESTION = "Who may certify batch release?";
export const HITS = [
  { page: 5, score: "0.0328", vector: [1, "0.284"], fulltext: 1, text: "When a computerised system is used for recording certification and batch release, the system should allow only Qualified Persons to certify the release of the batches and it should clearly identify and record the person releasing or certifying the batches." },
  { page: 4, score: "0.0320", vector: [3, "0.341"], fulltext: 2, text: "8. Printouts 8.1 It should be possible to obtain clear printed copies of electronically stored data. 8.2 For records supporting batch release it should be possible to generate printouts indicating if any of the data has been changed since the original entry." },
  { page: 5, score: "0.0161", vector: null, fulltext: 3, text: "15. Batch release" },
];

export const CHUNKS = [
  { page: 3, position: 1, chars: 330, text: "6. Accuracy Checks For critical data entered manually, there should be an additional check on the accuracy of the data. This check may be done by a second operator or by validated electronic means. The criticality and the potential consequences of erroneous or incorrectly entered data to a system should be covered by risk management." },
  { page: 3, position: 2, chars: 236, text: "7. Data Storage 7.1 Data should be secured by both physical and electronic means against damage. Stored data should be checked for accessibility, readability and accuracy. Access to data should be ensured throughout the retention period." },
  { page: 3, position: 3, chars: 196, short: true, text: "7.2 Regular back-ups of all relevant data should be done. Integrity and accuracy of backup data and the ability to restore the data should be checked during validation and monitored periodically." },
  { page: 4, position: 1, chars: 262, text: "8. Printouts 8.1 It should be possible to obtain clear printed copies of electronically stored data. 8.2 For records supporting batch release it should be possible to generate printouts indicating if any of the data has been changed since the original entry." },
];
export const DOC_STATS = { chunks: "7", average: "215", shortest: "17", longest: "330", short: "2" };
