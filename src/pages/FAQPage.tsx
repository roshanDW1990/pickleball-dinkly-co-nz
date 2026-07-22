import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string | React.ReactNode;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-start">
        <HelpCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
        {question}
      </h3>
      <div className="text-slate-600 leading-relaxed ml-7">
        {answer}
      </div>
    </div>
  );
};

export const FAQPage: React.FC = () => {
  const faqs: FAQItemProps[] = [
    {
      question: "Why create a profile?",
      answer: "To create a profile, you must first register with us. Your profile provides your experience level so we can place you in the most suitable group for competitive and enjoyable matches."
    },
    {
      question: "What is a Round?",
      answer: (
        <>
          <p className="mb-3">Each League runs in "Rounds," with each Round lasting 8 weeks. You can find Round dates on the League page. All matches must be played within those dates.</p>
          <p className="text-sm italic">For example, if a Round starts on 1 February 2024, it will end on 28 March 2024 (inclusive).</p>
        </>
      )
    },
    {
      question: "How do I join a Round?",
      answer: (
        <>
          <ol className="list-decimal list-inside space-y-2 mb-3">
            <li>Log in to your account.</li>
            <li>Go to the League page and select the league(s) you want to join.</li>
            <li>Click Join Round.</li>
          </ol>
          <p>If the button isn't visible, it means no Round is open or the Round has already begun.</p>
        </>
      )
    },
    {
      question: "How many matches will I play?",
      answer: "You'll typically play 4–6 matches, depending on group size and participation levels. Most groups have around 6 players, which means a maximum of 5 possible matches."
    },
    {
      question: "Does my experience level matter?",
      answer: "Dinkly is open to all skill levels. Groups are formed based on your experience—using your interclub ranking or the level you provided during registration—so matches stay fair and enjoyable."
    },
    {
      question: "I'm not happy with my group. Can I change it?",
      answer: (
        <>
          <p className="mb-3">Group placements cannot be changed once a Round has started. We place you in the best group based on your interclub ranking, past Round performance, or your initial registration form.</p>
          <p>Groups update each Round depending on sign-ups. Generally, if you win your group, you will move up to the next group (depending on how many groups there are in that League).</p>
        </>
      )
    },
    {
      question: "Where and when are matches played?",
      answer: (
        <>
          <p className="mb-3">You and your opponent decide the time and location.</p>
          <p className="mb-3">You can:</p>
          <ul className="list-disc list-inside space-y-1 mb-3 ml-4">
            <li>Arrange matches directly with players in your group</li>
            <li>Play on public courts or local club courts (fees may apply)</li>
          </ul>
          <p>If there is a court fee, you and your opponent should split the cost.</p>
        </>
      )
    },
    {
      question: "I've joined a Round—what happens next?",
      answer: (
        <>
          <p className="mb-3">After the sign-up period closes, we assign players to groups based on ranking, previous results, or (for new players) their registration form.</p>
          <p>The day before the Round begins, we will email you all details, including the contact information of players in your group.</p>
        </>
      )
    },
    {
      question: "Who books the courts?",
      answer: (
        <>
          <p className="mb-3">You and your opponent decide who will book the court and pay any applicable fee. Afterwards, you should agree on splitting the cost.</p>
          <p className="font-medium text-green-700">Tip: Look for free public courts in your area.</p>
        </>
      )
    },
    {
      question: "How do I report scores?",
      answer: (
        <>
          <p>The winner of each match logs in and submits the result through their dashboard. Results are reviewed and approved by an admin before appearing on the standings.</p>
        </>
      )
    },
    {
      question: "What if I need to withdraw from a Round?",
      answer: "If you can no longer participate, email us and we will officially withdraw you from the Round."
    },
    {
      question: "Can I play matches after the Round ends?",
      answer: "No. Matches played after the final Round day will not count. Be sure to schedule your matches early so you don't miss the deadline."
    },
    {
      question: "What if other players don't respond?",
      answer: (
        <>
          <p className="mb-3">We recommend:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Message players individually with your availability.</li>
            <li>Create a WhatsApp group for easier communication.</li>
            <li>Offer to reserve a court.</li>
            <li>Book a court and share the date/time with the group (remember to cancel if unused to avoid fees).</li>
            <li>If emails aren't answered, try texting or calling.</li>
          </ol>
        </>
      )
    },
    {
      question: "How are results confirmed?",
      answer: (
        <>
          <p className="mb-3">All results are verified by the Dinkly team before being added to the standings.</p>
          <p>Once approved, both players receive an email confirmation.</p>
        </>
      )
    },
    {
      question: "What if a match is incomplete?",
      answer: (
        <>
          <p>If a match stops due to injury, weather, or time constraints, you may reschedule with your opponent.</p>
        </>
      )
    }
  ];

  return (
    <>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 to-emerald-600 py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-green-50 max-w-2xl mx-auto">
            Find answers to common questions about Dinkly
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-green-50 rounded-xl p-8 border border-green-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center">
            Still have questions?
          </h2>
          <p className="text-slate-600 text-center mb-6">
            We're here to help! Feel free to reach out to us.
          </p>
          <div className="text-center">
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
