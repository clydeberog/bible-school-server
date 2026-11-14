import { MapPin } from 'lucide-react';

const CHURCH_NAME = 'New Life Fundamental Baptist Church';
const CHURCH_ADDRESS = '217 Amparo St. Pobllacion, Leyte, Philippines';

export function VisitUsSection() {
  return (
    <section
      aria-labelledby="visit-us-heading"
      className="border-t border-[#E5DFD3] bg-[#F5F1E8]/35"
    >
      <div className="mx-auto grid max-w-[1200px] gap-8 px-6 py-12 md:grid-cols-12 md:items-center">
        <div className="md:col-span-7">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/aistudio/4a52c352-b439-44b9-9ab2-e11bf7c67dfe_57428442.jpg"
              alt="New Life Fundamental Baptist Church - School of Ministry logo"
              referrerPolicy="no-referrer"
              className="h-14 w-14 shrink-0 rounded-full border border-[#E5DFD3] bg-white object-contain p-1 shadow-xs"
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#57534E]">
                Contact or Visit Us
              </p>
              <h2
                id="visit-us-heading"
                className="mt-1 font-serif text-2xl font-semibold tracking-tight text-[#1E293B]"
              >
                {CHURCH_NAME}
              </h2>
            </div>
          </div>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#57534E]">
            Students, prospective enrollees, and visitors are welcome to join us at {CHURCH_NAME} &ndash; School of Ministry.
          </p>
        </div>

        <div className="md:col-span-5">
          <div className="rounded-xl border border-[#E5DFD3] bg-[#FBF9F5] p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5DFD3] bg-[#F5F1E8] text-[#1E3A8A]">
                <MapPin className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#57534E]">
                  Address
                </p>
                <p className="mt-1 font-serif text-base font-semibold text-[#1E293B]">
                  {CHURCH_NAME}
                </p>
                <p className="mt-0.5 text-xs text-[#57534E]">
                  School of Ministry
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#1E293B]">
                  {CHURCH_ADDRESS}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
