/* Peached Tortilla — Manager Training — module content */

const APP = {
  "brand": "The Peached Tortilla",
  "tagline": "Manager Training",
  "sealTop": "THE PEACHED TORTILLA",
  "sealBottom": "MANAGER TRAINING",
  "sealCenter": "PT",
  "managerPass": "1306",
  "cloudCollection": "peached_progress",
  "notifyEmails": [
    "shavonne@irghospitality.com",
    "heather@irghospitality.com"
  ]
};

const MODULES = [
  {
    "id": "8.1-8.2",
    "level": 1,
    "type": "course",
    "title": "Company Identity, Mission & The Employee Handbook",
    "subtitle": "Who we are & the rules we live by",
    "audience": "All New Managers / Shift Leaders",
    "time": "Training + ~20 min",
    "why": "Every IRG leader must answer two questions without hesitation: “Who is IRG?” and “Why does what we do matter?” The Employee Handbook is the operating agreement between IRG and every person on the team — know it well enough to model the standards and answer questions confidently.",
    "objectives": [
      "Articulate who IRG is, the mission, and the core values in your own words.",
      "Explain your place in the org structure and how decisions flow.",
      "Model and enforce all eight handbook policy areas.",
      "Direct any team member to the right policy — and know when to escalate."
    ],
    "courses": [
      {
        "name": "A Manager’s Guide to the Employee Handbook",
        "url": "https://irghospitality.github.io/manager-handbook/",
        "covers": "Company history, mission, values, portfolio, org structure, and all handbook policies."
      },
      {
        "name": "Respectful Workplace & Harassment Prevention",
        "url": "https://irghospitality.github.io/harassment/",
        "covers": "Required Level 1 training. Must pass at 85% before managing independently. Annual renewal."
      }
    ],
    "content": [
      {
        "t": "h",
        "x": "The Eight Policy Areas at a Glance"
      },
      {
        "t": "p",
        "x": "A fast reference you should speak to from memory. The training covers each in depth."
      },
      {
        "t": "table",
        "head": [
          "Policy Area",
          "The Non-Negotiable"
        ],
        "rows": [
          [
            "Dress Code & Appearance",
            "Full uniform by role, non-slip footwear, hair contained in food roles, no gel/acrylic nails on the line. Follow IRG brand standards for tattoos and piercings."
          ],
          [
            "Attendance & Tardiness",
            "On time = at your station ready. Call-outs by phone to the restaurant — texting a coworker doesn’t count. NCNS: written warning first, termination on second within 6 months. Three tardies in 30 days = written coaching."
          ],
          [
            "Cell Phone & Technology",
            "Phones off the floor, break areas only. No earbuds on the floor or in the kitchen. No guest photography. No posting restaurant content without manager approval."
          ],
          [
            "Harassment & Respectful Workplace",
            "Zero tolerance. Report to GM or HR immediately. No retaliation ever. Managers listen, support, escalate same day — never investigate themselves. Required training passed at 85%."
          ],
          [
            "Discrimination & Fraternization",
            "No employment decision based on any protected characteristic. Manager-subordinate romantic relationships prohibited — disclose to HR immediately. Scheduling favoritism is a compliance risk."
          ],
          [
            "Drugs & Alcohol",
            "Zero tolerance for working impaired. No alcohol on premises during shifts. Marijuana’s legal status doesn’t override IRG’s impairment policy. Suspected impairment: remove from floor, notify GM, document."
          ],
          [
            "Smoking & Tobacco",
            "No smoking or vaping inside any facility. Designated outdoor areas only. Wash hands on return. Smoke breaks come out of scheduled break time — not in addition."
          ],
          [
            "Code of Conduct",
            "Theft, falsification, violence, and harassment are immediate termination — no progressive discipline. Insubordination is terminable after documentation. Disparaging social posts are subject to discipline up to termination."
          ]
        ]
      }
    ],
    "scenario": {
      "title": "Company Identity Pitch",
      "text": "If a new team member asked you on their first day, “What kind of company is this?” — what would you say?",
      "prompt": "Write your answer in 3–4 sentences: who IRG is, the mission, and what the values look like on the floor — in your own words."
    },
    "check": [
      {
        "q": "In one or two sentences, what is the IRG mission — in your own words?",
        "a": ""
      },
      {
        "q": "What is the NCNS policy for a first offense, and for a second within 6 months?",
        "a": ""
      },
      {
        "q": "A team member reports harassment. What are your first three obligations?",
        "a": ""
      },
      {
        "q": "Name three of the four fireable-on-first-offense behaviors under the Code of Conduct.",
        "a": ""
      },
      {
        "q": "A manager starts dating someone they supervise. What must happen?",
        "a": ""
      }
    ],
    "field": [
      "Pass the IRG Employee Handbook knowledge assessment — minimum 85%.",
      "Complete and pass Respectful Workplace & Harassment Prevention — minimum 85%."
    ],
    "signoff": [
      "Handbook training + supplement + knowledge check",
      "Company Identity Pitch delivered",
      "Handbook assessment passed (85%+)",
      "Harassment training passed (85%+)",
      "Policy quick-fire handled confidently"
    ]
  },
  {
    "id": "8.5",
    "level": 1,
    "type": "self",
    "title": "Workers’ Compensation: Employee & Guest Injuries",
    "subtitle": "Your first five minutes — and the paperwork that protects everyone",
    "audience": "All New Managers / Shift Leaders",
    "time": "~35 min",
    "why": "When someone is hurt on IRG property — team member or guest — your response in the first five minutes matters more than almost anything else. Handled well, you take care of the injured person AND protect IRG. Handled poorly — or undocumented — a small incident becomes a denied claim, a lawsuit, or a team member stuck with a medical bill that was never theirs to pay. This module walks the whole process, step by step.",
    "objectives": [
      "Triage an employee injury by severity and take the right first action.",
      "Send an injured employee to an approved treatment location the right way — and never let them pay.",
      "Use the Workers’ Compensation Treatment & Testing Referral form correctly, including the testing decision.",
      "Handle a guest injury without creating legal exposure, and document every incident the same day."
    ],
    "content": [
      {
        "t": "h",
        "x": "Step 1 — Make sure they’re safe, and read the severity"
      },
      {
        "t": "p",
        "x": "Before anything else, get to the injured person and gauge how serious it is. Severity decides your very next move."
      },
      {
        "t": "table",
        "head": [
          "Severity",
          "Examples",
          "Your first move"
        ],
        "rows": [
          [
            "Emergency",
            "Heavy bleeding, head injury, loss of consciousness, trouble breathing, severe burns, a bad fall, anything you’re unsure about",
            "Call 911 immediately. Then notify your GM. Don’t move them unless they’re in danger."
          ],
          [
            "Needs medical care (not an emergency)",
            "A cut needing stitches, a burn, a sprain/strain, a slip with lingering pain",
            "Send them to an approved treatment location with the referral form (Steps 2–4). Notify your GM."
          ],
          [
            "Minor / first-aid only",
            "Small nick, minor bump, something the first-aid kit fully handles",
            "Provide first aid, then still document it the same day (Step 5). Watch for it worsening."
          ]
        ]
      },
      {
        "t": "callout",
        "title": "When in doubt, treat it as more serious",
        "lines": [
          "People minimize their own injuries in the moment — especially in front of the team. If you’re unsure whether it’s an emergency, err up and call for help."
        ]
      },
      {
        "t": "h",
        "x": "Step 2 — Send them to an approved treatment location"
      },
      {
        "t": "p",
        "x": "For any injury needing care beyond first aid, the employee goes to an approved medical or occupational-health location — not their own family doctor and not “I’ll just tough it out.” Approved locations know how to treat and bill a workers’ comp injury correctly."
      },
      {
        "t": "ul",
        "x": [
          "If you don’t know your area’s approved clinic, your GM or the Manager Portal has the list. Know it before you need it.",
          "For a true emergency, the ER is the approved location — send them (or the ambulance takes them) and sort out paperwork after.",
          "Arrange safe transportation. An injured employee should not be driving themselves if they’re impaired by the injury or medication."
        ]
      },
      {
        "t": "h",
        "x": "Step 3 — They NEVER pay, and never use personal insurance"
      },
      {
        "t": "p",
        "x": "This is the one people get wrong. A work injury is covered by workers’ compensation — the employee does not pay a copay, does not hand over a personal insurance card, and does not get stuck with a bill."
      },
      {
        "t": "callout",
        "title": "Say it plainly, out loud",
        "lines": [
          "“This is a work injury, so it’s covered by workers’ compensation. You will not pay for this visit. Take this form with you — it tells the clinic exactly how to bill it.”",
          "Using personal insurance instead can get the claim denied and create a mess to unwind. Stop it before it happens."
        ]
      },
      {
        "t": "h",
        "x": "Step 4 — The Workers’ Compensation Treatment & Testing Referral form"
      },
      {
        "t": "p",
        "x": "This is the form you send with the employee (find it on the Manager Portal). It already carries everything the clinic needs to bill the injury correctly, and it’s where you make the drug/alcohol testing decision."
      },
      {
        "t": "table",
        "head": [
          "What the form already includes",
          "What you decide on it"
        ],
        "rows": [
          [
            "Company name, workers’ comp carrier, and policy number — so the clinic bills the carrier, not the employee.",
            "Whether post-accident testing is required. If it isn’t, you simply check “No testing required.”"
          ]
        ]
      },
      {
        "t": "sub",
        "x": "When post-accident testing IS warranted"
      },
      {
        "t": "ul",
        "x": [
          "The injury involved equipment, a vehicle, or machinery (fryer, slicer, delivery vehicle, etc.).",
          "There’s any reasonable suspicion of impairment — smell, behavior, slurred speech, unsteadiness.",
          "The incident type is one your policy flags for testing, or your GM/HR directs it."
        ]
      },
      {
        "t": "sub",
        "x": "When testing is usually NOT needed"
      },
      {
        "t": "ul",
        "x": [
          "A minor, first-aid injury with no equipment involved and no suspicion of impairment.",
          "If you’re unsure, call your GM or HR before checking the box — don’t guess in either direction."
        ]
      },
      {
        "t": "callout",
        "title": "Simple rule",
        "lines": [
          "If testing applies, mark it on the form and the clinic runs the screen at the same visit. If it doesn’t, check “No testing required.” Either way, the decision lives on the referral form — you don’t send them somewhere separate."
        ]
      },
      {
        "t": "h",
        "x": "Step 5 — Document and file, same day"
      },
      {
        "t": "ul",
        "x": [
          "Complete the Employee Injury Report and get it to HR the same day so the claim can be opened. Waiting hurts the employee and the claim.",
          "Write down what happened factually: time, location, what the employee was doing, what they reported, witnesses.",
          "Follow up: if the clinic sets work restrictions (light duty), honor them and adjust the schedule. Keep in contact until they’re cleared."
        ]
      },
      {
        "t": "callout",
        "title": "The rule that governs everything",
        "lines": [
          "Every incident — even a minor one — is documented the same day. An undocumented injury does not exist legally and can’t be defended if it worsens later."
        ]
      },
      {
        "t": "h",
        "x": "Guest injuries — a different playbook"
      },
      {
        "t": "ul",
        "x": [
          "Respond immediately, calmly, with eye contact.",
          "Do NOT admit fault. Say: “I want to make sure you’re okay — let me get our manager right away.”",
          "Call your GM. A guest injury is always a two-manager situation.",
          "Complete a Guest Incident Report: witnesses, conditions, time, exactly what was observed.",
          "Offer help getting them comfortable — but never offer free food, gift cards, refunds, or any payment/compensation without GM approval."
        ]
      }
    ],
    "scenario": {
      "title": "The “I’m Fine” Slip",
      "text": "A line cook slips near the dish pit, catches himself, says “I’m good” and keeps working. Twenty minutes later he’s favoring his wrist but waves you off — he doesn’t want the hassle, and he mentions his insurance has a high deductible.",
      "prompt": "Walk through what you do and in what order. What exactly do you say about who pays? What do you document even though he says he’s fine — and why?"
    },
    "check": [
      {
        "q": "How do you decide whether to call 911 versus send someone to a clinic?",
        "a": ""
      },
      {
        "q": "Where does an injured employee go for care, and where do you find your approved location?",
        "a": ""
      },
      {
        "q": "A team member worries about the cost and offers their insurance card. What do you say?",
        "a": ""
      },
      {
        "q": "What does the Workers’ Compensation Treatment & Testing Referral form already contain, and what do you decide on it?",
        "a": ""
      },
      {
        "q": "Name two situations where post-accident testing is warranted, and what you do if no test is needed.",
        "a": ""
      },
      {
        "q": "What are three things you must NOT do when a guest is injured?",
        "a": ""
      }
    ],
    "field": [
      "Locate your area’s approved treatment location and the referral form on the Manager Portal.",
      "Complete a full employee-injury packet (referral form + Injury Report) for a real or simulated incident, GM-verified.",
      "Complete a Guest Incident Report for a simulated slip."
    ],
    "signoff": [
      "Part 1 + knowledge check",
      "Can triage severity and take the right first action",
      "Uses the referral form correctly incl. the testing decision",
      "Knows the never-pay rule and can say it out loud",
      "Assembled a verified injury packet + guest incident report"
    ]
  },
  {
    "id": "pto",
    "level": 1,
    "type": "self",
    "title": "How to Request PTO",
    "subtitle": "The four steps, every time",
    "audience": "Peached Tortilla Managers",
    "time": "~20 min",
    "why": "Requesting time off the right way protects you and keeps the floor covered. Every PTO request follows the same four steps — and skipping any one of them means the time off is not approved, and not paid. This walks the full Peached process, including the Google PTO Calendar step people forget and the rules that catch managers off guard.",
    "objectives": [
      "Run all four PTO request steps in order.",
      "Write a coverage plan your GM can approve.",
      "Add approved dates to the Google PTO Calendar — the step that completes the request.",
      "Apply the extended-leave, coverage-limit, and blackout rules."
    ],
    "content": [
      {
        "t": "h",
        "x": "The four steps — skip one and it is not approved"
      },
      {
        "t": "ol",
        "x": [
          "Talk to your GM first. Confirm the dates before you book travel or commit to plans.",
          "Write a coverage plan: who is covering each shift, how your responsibilities will be handled, and any scheduling or payroll impact.",
          "Submit the request in Toast — no later than three weeks out, unless it is an emergency. Your GM receives it by email and responds there. Log in at payroll.toasttab.com or use the MyToast app: Time Off → Request Time Off → choose your dates (one full day = 8 hrs) → add a reason in the Notes section → Submit.",
          "Add your approved dates to the Google PTO Calendar. Your request is not complete until this is done."
        ]
      },
      {
        "t": "callout",
        "title": "The Google PTO Calendar",
        "lines": [
          "You have been invited to a shared Google PTO Calendar through your work email — it gives the whole team one view of who is out so coverage can be planned.",
          "Once your PTO is approved, YOU are responsible for entering your approved dates. Your GM will not do it for you. This step is required, not optional."
        ]
      },
      {
        "t": "h",
        "x": "Additional rules"
      },
      {
        "t": "table",
        "head": [
          "Rule",
          "What it means"
        ],
        "rows": [
          [
            "Extended time off",
            "Requests of more than five (5) consecutive days need executive team approval — your GM cannot approve these alone. Complete steps 1 and 2, then present the request and your coverage plan to the executive team."
          ],
          [
            "Coverage limit",
            "No more than two (2) managers out on PTO at the same time per location. Requests are taken in the order received. Exceptions need written approval from your GM and Regional Manager."
          ],
          [
            "Unapproved time off",
            "Time off taken without completing all four steps is unpaid. Do not book travel or commit to plans before your request is approved."
          ]
        ]
      },
      {
        "t": "callout",
        "title": "Blackout dates — not approved except an emergency or with written GM / Regional approval",
        "lines": [
          "February 1–16 — Valentine’s Day period",
          "May 1–12 and May 25–26 — Mother’s Day, Graduation Weekend, and Memorial Day",
          "August 23 – September 14 — Austin Restaurant Week",
          "November 14 – December 18 — Holiday Season",
          "Easter Brunch and Labor Day Weekend — dates vary annually"
        ]
      },
      {
        "t": "links",
        "x": [
          {
            "label": "Toast Payroll — request time off (login)",
            "url": "https://payroll.toasttab.com/"
          }
        ]
      }
    ],
    "scenario": {
      "title": "Six Days Off in May",
      "text": "A manager wants six consecutive days off in mid-May for a family wedding and asks you to just approve it so they can book flights today.",
      "prompt": "Walk them through what has to happen before this could be approved. Name every rule that applies here (there are at least two), and what you would tell them about booking those flights right now."
    },
    "check": [
      {
        "q": "What are the four steps of a PTO request, in order?",
        "a": ""
      },
      {
        "q": "What is the final step that makes a request complete — and who is responsible for it?",
        "a": ""
      },
      {
        "q": "How many consecutive days can a GM approve alone, and what happens beyond that?",
        "a": ""
      },
      {
        "q": "How many managers can be out on PTO at the same time per location?",
        "a": ""
      },
      {
        "q": "What happens if someone takes time off without completing all four steps?",
        "a": ""
      },
      {
        "q": "Name two blackout periods.",
        "a": ""
      }
    ],
    "field": [
      "Submit one real PTO request in Toast following all four steps, including the Google PTO Calendar entry.",
      "Write a sample coverage plan for a 3-day absence and review it with your GM."
    ],
    "signoff": [
      "Part 1 + knowledge check",
      "Runs all four steps in order",
      "Knows the Google PTO Calendar is the completing step",
      "Knows extended-leave, coverage-limit & blackout rules",
      "Submitted one real request correctly"
    ]
  }
];

if (typeof module !== "undefined") { module.exports = { MODULES, APP }; }
