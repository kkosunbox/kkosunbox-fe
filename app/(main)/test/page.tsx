const SAMPLE_TEXT = `꼬순박스 디자인 테스트
가나다라마바사 아자차카타파하
ABC abc 1234567890
직접 문장을 수정해서 폰트 느낌을 확인해보세요.`;

const fontSamples = [
  {
    name: "Pretendard",
    description: "패키지 기반 로컬 셀프호스팅",
    family: '"Pretendard", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
  },
  {
    name: "GangwonEduAll Light",
    description: "local TTF / GangwonEduAll-Light.ttf",
    family: '"GangwonEduAll Light", serif',
  },
  {
    name: "GangwonEduAll Bold",
    description: "local TTF / GangwonEduAll-Bold.ttf",
    family: '"GangwonEduAll Bold", serif',
  },
  {
    name: "GangwonEduPower",
    description: "local TTF / GangwonEduPower.ttf",
    family: '"GangwonEduPower", sans-serif',
  },
  {
    name: "Griun Fromsol",
    description: "local TTF / Griun_Fromsol-Rg.ttf",
    family: '"Griun Fromsol", cursive',
  },
  {
    name: "Griun Yuri Daggu",
    description: "local TTF / Griun_YuriDaggu-Rg.ttf",
    family: '"Griun Yuri Daggu", cursive',
  },
] as const;

export default function FontTestPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-medium text-zinc-500">/test</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Font Textarea Test
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-600">
            각 textarea에 직접 타이핑하면서 Pretendard와 현재 프로젝트에
            포함된 5개 폰트가 어떻게 렌더링되는지 바로 비교할 수 있습니다.
          </p>
        </header>

        <section className="grid gap-5 lg:grid-cols-2">
          {fontSamples.map((font) => (
            <article
              key={font.name}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              style={{ fontFamily: font.family }}
            >
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{font.name}</h2>
                  <p className="text-sm text-zinc-500">{font.description}</p>
                </div>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                  textarea
                </span>
              </div>

              <textarea
                className="min-h-56 w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-lg leading-8 outline-none transition focus:border-zinc-400 focus:bg-white"
                defaultValue={SAMPLE_TEXT}
                style={{ fontFamily: font.family }}
              />
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
