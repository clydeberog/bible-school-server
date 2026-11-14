import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

interface NewsItem {
  id: string;
  date: string;
  category: string;
  title: string;
  summary: string;
  location: string;
}

const CHURCH_NEWS_ITEMS: NewsItem[] = [
  {
    id: 'convocation-2026',
    date: 'August 2026',
    category: 'School of Ministry',
    title: '1st Semester Orientation & Opening Convocation',
    summary:
      'Welcoming returning and incoming seminary students for SY 2026–2027 with syllabus distribution, virtual classroom orientation, and prayer.',
    location: 'Main Sanctuary & Google Meet',
  },
  {
    id: 'midweek-exposition',
    date: 'Every Wednesday · 6:30 PM',
    category: 'Midweek Fellowship',
    title: 'Church Prayer Meeting & Verse-by-Verse Bible Study',
    summary:
      'Weekly congregational gathering devoted to corporate prayer, pastoral exposition of Scripture, and ministry encouragement for students and families.',
    location: 'Church Fellowship Hall',
  },
  {
    id: 'missions-practicum',
    date: 'Monthly · First Saturday',
    category: 'Outreach & Missions',
    title: 'Community Visitation & Ministry Practicum',
    summary:
      'Faculty and School of Ministry enrollees join local church leaders for neighborhood evangelism, discipleship follow-up, and practical pastoral training.',
    location: 'Poblacion & Surrounding Barangays, Leyte',
  },
];

export const ChurchNewsSection: React.FC = () => {
  return (
    <section
      aria-labelledby="church-news-heading"
      className="mt-12 border-t border-[#E5DFD3] pt-10"
    >
      <div>
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E5DFD3] pb-6">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#57534E]">
              New Life Fundamental Baptist Church &middot; Leyte
            </p>
            <h2
              id="church-news-heading"
              className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#1E293B]"
            >
              Church News &amp; Activities
            </h2>
          </div>
          <p className="text-sm text-[#57534E] max-w-md">
            Upcoming gatherings, academic milestones, and local ministry activities across our church and School of Ministry.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {CHURCH_NEWS_ITEMS.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-lg border border-[#E5DFD3] bg-white p-6"
            >
              <div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#57534E]">
                  <span className="font-semibold text-[#1E3A8A]">{item.category}</span>
                  <span aria-hidden="true">&middot;</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-[#57534E]" aria-hidden="true" />
                    {item.date}
                  </span>
                </div>

                <h3 className="mt-3 font-serif text-xl font-semibold leading-snug text-[#1E293B]">
                  {item.title}
                </h3>

                <p className="mt-2.5 text-sm leading-relaxed text-[#57534E]">
                  {item.summary}
                </p>
              </div>

              <div className="mt-5 flex items-center gap-1.5 border-t border-[#E5DFD3] pt-4 text-xs text-[#57534E]">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#1E3A8A]" aria-hidden="true" />
                <span>{item.location}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
