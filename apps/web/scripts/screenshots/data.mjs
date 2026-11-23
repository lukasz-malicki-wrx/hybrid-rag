// Demo data for the screenshots of the app: the four public sample documents in samples/ and a
// few conversations about them. The quoted passages are the documents' own text, with their real
// page numbers, so a screenshot never shows anything private or made up about a document.

const now = Date.now();
/** An ISO time `days` days and `minutes` minutes ago. */
const ago = (days, minutes = 0) => new Date(now - days * 86_400_000 - minutes * 60_000).toISOString();

export const group = { id: "g1", name: "GMP", created_at: ago(9), conversation_count: 4, document_count: 3 };

const document = (id, filename, pages, extra = {}) => ({
  id,
  filename,
  sha256: id.padEnd(64, "0"),
  version: 1,
  supersedes_id: null,
  status: "ready",
  active: true,
  pages,
  error: null,
  progress: pages,
  progress_total: pages,
  uploaded_at: ago(9),
  deactivated_at: null,
  ...extra,
});

export const documents = [
  document("d1", "eu-gmp-annex11.pdf", 5),
  document("d2", "fda-data-integrity-qa.pdf", 17),
  document("d3", "fda-part11-scope.pdf", 12),
  document("d4", "ich-q9-r1.pdf", 29, { uploaded_at: ago(0, 4) }),
];
export const groupDocuments = documents.slice(0, 3);

const passage = (n, chunk_id, document_id, filename, page, text) => ({ n, chunk_id, document_id, filename, version: 1, page, text });

const ANNEX = "eu-gmp-annex11.pdf";
const releaseSources = [
  passage(1, 41, "d1", ANNEX, 5, "When a computerised system is used for recording certification and batch release, the system should allow only Qualified Persons to certify the release of the batches and it should clearly identify and record the person releasing or certifying the batches. This should be performed using an electronic signature."),
  passage(2, 33, "d1", ANNEX, 4, "For records supporting batch release it should be possible to generate printouts indicating if any of the data has been changed since the original entry."),
  passage(3, 34, "d1", ANNEX, 4, "Consideration should be given, based on a risk assessment, to building into the system the creation of a record of all GMP-relevant changes and deletions (a system generated \"audit trail\"). For change or deletion of GMP-relevant data the reason should be documented."),
  passage(4, 27, "d1", ANNEX, 3, "Data should be secured by both physical and electronic means against damage. Stored data should be checked for accessibility, readability and accuracy. Access to data should be ensured throughout the retention period."),
  passage(5, 28, "d1", ANNEX, 3, "Regular back-ups of all relevant data should be done. Integrity and accuracy of backup data and the ability to restore the data should be checked during validation and monitored periodically."),
  passage(6, 51, "d2", "fda-data-integrity-qa.pdf", 12, "Personnel responsible for record review under CGMP should review the audit trails that capture changes to data associated with the record as they review the rest of the record."),
];

const answer = (id, text, sources, created_at, extra = {}) => ({
  id,
  text,
  refused: false,
  uncited: false,
  stopped: false,
  citations: [...new Set([...text.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])))],
  sources,
  rating: null,
  created_at,
  ...extra,
});

const message = (query_id, question, created_at, answerValue, attachments = []) => ({
  query_id,
  question,
  created_at,
  attachments,
  answer: answerValue,
});

const conversation = (id, title, updated_at, preview, extra = {}) => ({
  id,
  group_id: null,
  title,
  created_at: updated_at,
  updated_at,
  favorite: false,
  preview,
  ...extra,
});

export const conversations = [
  conversation("c1", "Who may certify batch release?", ago(0, 3), "Before a batch is released, the system must make changes visible and keep the records safe:", { group_id: "g1", favorite: true }),
  conversation("c2", "What does ICH Q9 say about risk review?", ago(0, 41), "Risk management should be an ongoing part of the quality management process, and its results reviewed.", { group_id: "g1" }),
  conversation("c3", "How often must back-ups be checked?", ago(1, 75), "Integrity and accuracy of back-up data and the ability to restore it are checked during validation and monitored periodically."),
  conversation("c4", "Who should review audit trails?", ago(2, 10), "Personnel responsible for record review under CGMP review the audit trails along with the rest of the record.", { group_id: "g1", favorite: true }),
  conversation("c5", "Which records does Part 11 apply to?", ago(4, 200), "Records required by predicate rules and kept in electronic format instead of paper."),
  conversation("c6", "What are the two principles of quality risk management?", ago(6, 30), "Risk evaluation based on scientific knowledge and linked to patient protection; effort proportional to the risk."),
  conversation("c7", "Is a second check needed for manual data entry?", ago(12), "Yes: critical data entered by hand needs an additional accuracy check.", { group_id: "g1" }),
  conversation("c8", "Recipe for pancakes", ago(20), null),
];

export const details = {
  c1: {
    ...conversations[0],
    documents: [],
    messages: [
      message("q1", "Who may certify batch release in a computerised system?", ago(1, 90), answer("a1", "Only a Qualified Person may certify the release of a batch, and the system has to identify and record who did it, with an electronic signature [1].", releaseSources, ago(1, 89), { rating: "up" })),
      message("q2", "What else has to be in place before a batch is released, and how are the records protected?", ago(0, 4), answer("a2", "Before a batch is released, the system must make changes visible and keep the records safe:\n\n1. Records that support batch release can be printed in a way that shows whether any data changed since it was entered [2].\n2. A risk assessment decides whether the system keeps an **audit trail** of every GMP-relevant change and deletion, with the reason for it [3].\n3. Data is protected against damage and checked for accessibility, readability and accuracy throughout the retention period [4].\n\nBack-ups are taken regularly, and restoring them is checked during validation and monitored periodically [5].", releaseSources, ago(0, 3))),
    ],
  },
  c2: {
    ...conversations[1],
    documents: [{ id: "d4", filename: "ich-q9-r1.pdf", version: 1, status: "ready", active: true }],
    messages: [
      message(
        "q3",
        "What does ICH Q9 say about risk review?",
        ago(0, 42),
        answer("a3", "Risk management should be an ongoing part of the quality management process, with a mechanism to review or monitor events [1]. Its results should be reviewed to take new knowledge and experience into account [1].\n\nThe effort, formality and documentation of the process should match the level of risk [2].", [
          passage(1, 88, "d4", "ich-q9-r1.pdf", 10, "Risk management should be an ongoing part of the quality management process. A mechanism to review or monitor events should be implemented. The output/results of the risk management process should be reviewed to take into account new knowledge and experience."),
          passage(2, 71, "d4", "ich-q9-r1.pdf", 6, "The level of effort, formality and documentation of the quality risk management process should be commensurate with the level of risk."),
        ], ago(0, 41)),
        [{ id: "d4", filename: "ich-q9-r1.pdf", version: 1, status: "ready", active: true }],
      ),
    ],
  },
};

export const chunks = [
  { id: 25, page: 3, position: 0, text: "6. Accuracy Checks For critical data entered manually, there should be an additional check on the accuracy of the data. This check may be done by a second operator or by validated electronic means. The criticality and the potential consequences of erroneous or incorrectly entered data to a system should be covered by risk management.", chars: 330 },
  { id: 27, page: 3, position: 1, text: "7. Data Storage 7.1 Data should be secured by both physical and electronic means against damage. Stored data should be checked for accessibility, readability and accuracy. Access to data should be ensured throughout the retention period.", chars: 236 },
  { id: 28, page: 3, position: 2, text: "7.2 Regular back-ups of all relevant data should be done. Integrity and accuracy of backup data and the ability to restore the data should be checked during validation and monitored periodically.", chars: 196 },
  { id: 33, page: 4, position: 0, text: "8. Printouts 8.1 It should be possible to obtain clear printed copies of electronically stored data. 8.2 For records supporting batch release it should be possible to generate printouts indicating if any of the data has been changed since the original entry.", chars: 262 },
  { id: 34, page: 4, position: 1, text: "9. Audit Trails Consideration should be given, based on a risk assessment, to building into the system the creation of a record of all GMP-relevant changes and deletions (a system generated \"audit trail\").", chars: 205 },
  { id: 40, page: 5, position: 0, text: "15. Batch release", chars: 17 },
  { id: 41, page: 5, position: 1, text: "When a computerised system is used for recording certification and batch release, the system should allow only Qualified Persons to certify the release of the batches and it should clearly identify and record the person releasing or certifying the batches.", chars: 262 },
];

const hit = (chunk, document_id, filename, score, vector_rank, distance, fulltext_rank) => ({
  id: chunk.id,
  document_id,
  filename,
  version: 1,
  page: chunk.page,
  position: chunk.position,
  text: chunk.text,
  distance,
  score,
  vector_rank,
  fulltext_rank,
});

export const searchQuestion = "Who may certify batch release?";
export const searchHits = [
  hit(chunks[6], "d1", ANNEX, 0.0328, 1, 0.284, 1),
  hit(chunks[3], "d1", ANNEX, 0.0320, 3, 0.341, 2),
  hit(chunks[5], "d1", ANNEX, 0.0161, null, null, 3),
  hit({ id: 52, page: 12, position: 2, text: "If the review frequency for the data is specified in CGMP regulations, adhere to that frequency for the audit trail review. For example, § 211.22 requires data review before batch release." }, "d2", "fda-data-integrity-qa.pdf", 0.0159, 2, 0.402, null),
  hit(chunks[4], "d1", ANNEX, 0.0156, 5, 0.433, null),
];

export const settings = {
  personal_context: "Answer briefly, as bullet points where it helps. Quote the exact requirement when there is one.",
  updated_at: ago(3),
};
