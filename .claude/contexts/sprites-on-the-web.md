[번역] 웹에서의 스프라이트
2026-03-30
원저자의 허락 하에 Sprites on the Web를 한국어로 번역한 글입니다.

2015년, 트위터가 아직 트위터였던 시절, 개발팀에 문제가 하나 있었습니다.

초기에는 작은 "⭐" 아이콘을 클릭해 트윗을 "즐겨찾기"할 수 있었습니다. 프로덕트 팀은 페이스북처럼 "❤️"를 사용해 트윗에 "좋아요"를 누르는 방식으로 전환하고 싶어 했습니다. 이 업데이트의 일환으로 디자이너들은 다음과 같은 멋진 애니메이션을 만들었습니다.

Twitter like animation sprite
정말 멋져 보이지만, 내부에서는 꽤 많은 요소들이 복잡하게 얽혀 있습니다. 제가 세어보니 16개의 개별 요소가 동시에 애니메이션되고 있었습니다(파티클 14개, 퍼지는 원 1개, 하트 1개). 트위터 웹 앱은 매우 저사양 모바일 기기에서도 실행되어야 했기 때문에, DOM 노드를 사용해 절차적으로 만드는 것은 적합하지 않았습니다. 그래서 비디오 게임에서 사용하는 스프라이트(sprites) 기법을 차용하기로 했습니다.

스프라이트의 기본 아이디어는 애니메이션 각 프레임을 긴 띠 형태의 단일 이미지로 만드는 것입니다. 그런 다음, 마치 구식 영사기에서 필름 롤이 지나가는 것 처럼 각 프레임을 아주 짧은 시간 동안 표시합니다.

스프라이트 필름 스트립 시각화GIF

이 기법은 수십 년간 사용되어 왔습니다. 2000년대 초반에 background-position으로 이 작업을 했던 기억이 어렴풋이 납니다. 다행히도, 모던 CSS는 스프라이트를 구현하는 훌륭한 새로운 옵션을 제공합니다!

이 글에서는 CSS에서 스프라이트를 다루는 가장 좋은 방법을 소개하고, 제가 발견한 몇 가지 활용 사례를 공유하겠습니다. 또한 스프라이트를 사용하지 말아야 할 때를 알아보기 위해 몇 가지 트레이드오프에 대해서도 이야기하겠습니다.

기본 구현
먼저, 에셋이 필요합니다! 몇 년 전에 제가 만든 금색 트로피 스프라이트를 사용해 보겠습니다.

A gold trophy with flickering flames
불꽃이 흔들리는 듯한 효과를 내기 위해, 파란 불꽃의 다섯 가지 버전을 그렸습니다. 이 프레임들을 나란히 나열시켜 "스프라이트시트(spritesheet)"라고 알려진 하나의 이미지로 만들었습니다.



핵심 전략은 이렇습니다. <img> 태그를 만들고 프레임 하나를 기준으로 크기를 계산합니다. 그런 다음 object-fit과 object-position을 사용해 현재 보이는 스프라이트 부분을 제어하고, CSS 키프레임(keyframe) 애니메이션으로 각 프레임을 넘깁니다.

이 전체 이미지의 네이티브 해상도는 2000px × 800px이고, 5개의 프레임으로 구성되어 있습니다. 각 프레임은 400px × 800px입니다. 고해상도 디스플레이에서 이미지가 선명하게 보이도록 하려면 이 크기를 절반으로 줄여야 하므로, 최종 이미지는 200px × 400px이 됩니다.

기본적으로 <img> 태그는 전체 이미지 콘텐츠를 DOM 노드 영역에 밀어 넣으려고 하므로, 5개의 트로피가 모두 함께 찌그러져 보이게 됩니다.

Code Playground
HTML
<style>
.trophy {
  width: 200px;
  height: 400px;
}
</style>

<img
class="trophy"
src="https://www.joshwcomeau.com/images/sprites/gold-trophy-sprite.png"
alt="A gold trophy with flickering flames"
/>
RESULT


이는 "object-fit" CSS 속성 때문입니다. 이 속성은 기본 이미지 크기와 <img> 요소 크기가 일치하지 않을 때 어떻게 처리할지 제어합니다.

기본값은 fill로, 이미지가 찌그러지더라도 전체 이미지가 보이도록 합니다. cover로 바꿔 봅시다.

Code Playground
HTML
<style>
.trophy {
  width: 200px;
  height: 400px;
  object-fit: cover;
}
</style>

<img
class="trophy"
src="https://www.joshwcomeau.com/images/sprites/gold-trophy-sprite.png"
alt="A gold trophy with flickering flames"
/>
RESULT


이제 뭔가 되어가는군요! cover는 기본 이미지를 <img> 노드의 전체 영역을 덮도록 스케일링합니다. 그 결과, 전체 이미지의 1/5만 보이게 됩니다.

다음으로, object-position 속성을 사용해 기본 이미지의 어느 부분이 보이는지 제어할 수 있습니다.

object-position 데모GIF

SVG 형식에 익숙하다면, 여기서 하는 작업은 개념적으로 viewBox를 수정해 이미지의 어느 부분을 표시할지 제어하는 것과 비슷합니다. 이 경우, <img> 태그는 트로피 스프라이트를 들여다보는 200×400 창이고, object-position 속성을 사용해 기본 이미지 데이터를 슬라이드할 수 있습니다.

거의 다 왔지만, 마지막으로 해결해야 할 문제가 하나 있습니다. 바로 애니메이션입니다. 각 트로피 변형 사이를 어떻게 전환하도록 설정할까요?

반복되는 키프레임 애니메이션을 추가해 봅시다.

Code Playground
HTML
<style>
@keyframes sprite {
  from {
    object-position: 0% 0%;
  }
  to {
    object-position: 100% 0%;
  }
}

.trophy {
  width: 200px;
  height: 400px;
  object-fit: cover;
  animation: sprite 2000ms linear infinite;
}
</style>

<img
class="trophy"
src="https://www.joshwcomeau.com/images/sprites/gold-trophy-sprite.png"
alt="A gold trophy with flickering flames"
/>
RESULT


문제는 이미지가 각 단계별로 끊어져서 움직이는 게 아니라, 부드럽게 미끄러지듯 이동하고 있다는 점입니다. 이 기법이 작동하려면, 5개의 프레임 각각을 동일한 시간 동안 표시해야 합니다.

자바스크립트의 setInterval()로 작업을 수행할 수도 있지만, 대신 사용할 수 있는 잘 알려지지 않은 CSS 타이밍 함수가 있습니다. 바로 steps입니다.

steps의 핵심 아이디어는 베지어(Bézier) 곡선을 사용해 부드럽게 전환하는 대신, 정해진 횟수만큼 중간 지점 사이를 뛰어넘는 것입니다. 경사로 대신 계단을 상상하면 됩니다. 아래 시각화한 것을 참고하면 더 명확해질 겁니다.

Timing function:
linear
ease-in
steps(5)
-- PROGRESSION --
-- TIME --
steps 타이밍 함수를 사용하면 전체 진행 과정을 여러 단계로 나눌 수 있습니다. 이 경우 5개의 단계를 지정하면, 애니메이션은 총 시간의 1/5씩 각 단계에서 소요하게 됩니다.

steps 함수는 전체 단계 수와 "단계 위치"를 인자로 받습니다. 단계 위치에 대해서는 잠시 후에 자세히 살펴보겠지만, 먼저 object-position을 사용해 <img> 노드 내에서 이미지 데이터를 슬라이딩하는, 트로피 스프라이트의 전체 구현을 보겠습니다.

Code Playground
HTML
<style>
@keyframes sprite {
  from {
    object-position: 0% 0%;
  }
  to {
    object-position: 100% 0%;
  }
}

.trophy {
  width: 200px;
  height: 400px;
  object-fit: cover;
  animation: sprite 1s steps(5, jump-none) infinite;
}
</style>

<img
class="trophy"
src="https://www.joshwcomeau.com/images/sprites/gold-trophy-sprite.png"
alt="A gold trophy with flickering flames"
/>
RESULT


정말 멋지다고 생각합니다. 😄

애니메이션 GIF를 사용해 보는 건 어때요?
이 모든 수고를 왜 했는지 궁금할 수 있습니다. <img src="/images/gold-trophy.gif" />로 같은 목표를 달성할 수 있지 않을까요?

이 접근 방식이 애니메이션 GIF보다 가지는 주요 이점은 훨씬 더 세밀하게 제어할 수 있다는 것입니다. animation-duration을 조정해 애니메이션 속도를 변경할 수 있습니다. animation-play-state를 사용해 정확한 시점에 애니메이션을 시작하거나 중지할 수도 있습니다. GIF에는 일시정지 버튼이 없고, 타이밍도 다소 일관적이지 않은 경향이 있습니다.

또한 이 접근 방식은 특히 최적화했을 때 성능이 더 뛰어난 경향이 있습니다. 실제 <GoldTrophy> 컴포넌트에서는 깜빡이는 파란 불꽃을 별도의 스프라이트시트로 분리해 정적인 금색 트로피 뒤에 레이어로 배치했습니다. 두 이미지 모두 모던 .avif 이미지 형식을 사용합니다. 합쳐도 30kb 미만인 반면, .gif는 100kb가 넘습니다(게다가 256색으로 제한됩니다!).

솔직히 말하면, 애니메이션 GIF가 충분히 잘 작동하는 상황도 많습니다. 하지만 스프라이트를 실험해 보기 시작하면, 흥미로운 새로운 가능성이 열린다는 데 동의하실 겁니다. 좀 더 고급 활용 사례는 뒤에서 공유하겠습니다.

단계 위치
위의 플레이그라운드에서 약간 이상한 점을 발견하셨을지도 모르겠습니다.

.trophy {
  object-fit: cover;
  animation: sprite 1s steps(5, jump-none) infinite;
}
steps() 함수는 두 개의 인자를 받습니다. 첫 번째 인자는 단계 수로, 그 의미가 매우 명확합니다. 그런데 jump-none은 대체 뭘까요?

두 번째 인자는 "단계 위치"이며, 기본값은 jump-end입니다. 이 모드에서 steps()는 이산값에서 최종 값을 제외합니다. 예를 들어, 키프레임 정의가 0%에서 100%로 가고 steps(5)를 설정하면, 레벨은 0%, 20%, 40%, 60%, 80%가 됩니다. 실제로 100%에는 도달하지 않습니다.

이를 명확하게 보여주는 플레이그라운드입니다.

Code Playground
HTML
<style>
@keyframes fill {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

.bar {
  /*
    "jump-end" is the default value, so we
    don't actually need to specify it, but
    I want this to be as clear as possible:
  */
  animation: fill 2000ms steps(5, jump-end) infinite;
}
</style>

<div class="wrapper">
<div class="bar"></div>
</div>
RESULT


fill 키프레임은 width: 0%에서 width: 100%까지 진행되지만, .bar 요소는 80% 너비를 넘지 못합니다!

처음에는 꽤 당혹스러웠지만, 이 동작이 반복하지 않는 애니메이션에서는 훨씬 더 합리적이라는 것을 깨달았습니다.

Code Playground
HTML
<style>
@keyframes fill {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

.bar {
  animation: fill 2000ms steps(5, jump-end) forwards;
}
</style>

<div class="wrapper">
<div class="bar"></div>
</div>

<p>
(RESULT 옆의 새로고침 아이콘을 클릭하면
애니메이션을 다시 실행합니다.)
</p>
RESULT


이 2초짜리 애니메이션 동안 바의 너비는 0%에서 80%로 커집니다. 애니메이션이 만료되는 정확히 2초 시점에, 키프레임 정의의 최종 값(width: 100%)이 적용됩니다.

따라서 기본적으로, steps()의 "단계 위치"는 jump-end이며, 애니메이션의 맨 끝에서 최종 값으로 점프합니다. 만약 이 점프가 없다면 막대는 1.6초 지점에 이미 최대 너비에 도달하게 되는데, 이는 많은 상황에서 너무 이르게 느껴질 수 있습니다.

하지만 트로피 스프라이트 같은 반복 애니메이션에서는 점프를 원하지 않습니다. 애니메이션이 끝나는 순간에 최종 프레임에 도달하는 것이 아니라, 우리가 교체하며 보여줄 5개의 독립된 값 중 하나로 그 최종 프레임을 포함하고 싶은 것입니다. steps(5, jump-none)을 지정함으로써 이를 구현할 수 있습니다.

인터럽트 처리
안타깝게도, steps() 함수는 인터럽트를 깔끔하게 처리하지 못합니다. 금색 트로피 애니메이션처럼 무한히 실행되는 경우에는 문제가 되지 않지만, 다른 상황에서는 문제가 될 수 있습니다.

예를 들어, Karey Higuera는 스프라이트를 사용해 멋진 레버 인터렉션을 만들고 있었습니다. 천천히 클릭하면 잘 작동하지만, 전환이 중단되면 약간 이상하게 동작합니다.

VIDEO
이는 CSS 트랜지션이 중단될 때 역방향으로 재생되면서 steps()에서 사용하는 이산값이 바뀌기 때문입니다. 이 글의 범위를 벗어나지만, 인터럽트 동작에 대해 더 자세히 알고 싶다면 CSSWG 스펙을 참고하세요.

Karey가 찾은 해결책은 새로운 round() 함수와 함께 선형 타이밍 함수를 사용하는 것이었습니다. round() 함수는 값을 지정된 가장 가까운 증분으로 반올림합니다. 이 접근 방식에 대해 더 알고 싶다면 Karey의 글을 참고하세요.

Interactive Pixel Spritesheet Animation with CSS
활용 사례
이 기법의 기본을 다루었으니, 실제로 언제 사용해야 하는지 이야기해 봅시다. 그리고 마찬가지로 중요하게, 언제 사용하지 말아야 하는지도요.

서두에서 트위터 개발팀이 부분적으로 성능을 고려해 스프라이트 기반 접근 방식을 선택했다고 언급했습니다. (출처: 2016년 컨퍼런스에서 트위터 개발자 한 명을 만났는데, 그가 알려줬습니다.)

2015년에는 타당한 선택이었다고 생각하지만, 2026년에는 반대 의견을 제시하고 싶습니다. 그 이후로 기기는 훨씬 빨라졌고 브라우저는 훨씬 더 최적화되었습니다. 가장 저사양 기기라도 14개의 파티클이 동시에 애니메이션되는 것을 거뜬히 처리할 수 있어야 합니다. 그리고 이런 것에 스프라이트를 사용하면 약간의 마법을 잃게 됩니다.

제 출시 예정 강좌인 Whimsical Animations에서, "좋아요" 버튼을 만들었습니다. 몇 번 클릭해 보세요.


이 방식의 멋진 점은 클릭할 때마다 결과가 조금씩 다르다는 것입니다. 파티클은 삼각함수와 무작위성을 사용해 절차적으로 생성됩니다. 반면, 트위터의 "좋아요" 버튼은 클릭할 때마다 정확히 동일합니다. 마치 같은 영상을 계속, 계속, 계속 재생하는 것과 같습니다. 😬

그렇다면, 스프라이트는 언제 사용해야 할까요? 주요 활용 사례는 음, 스프라이트처럼 보이는 것들이라고 생각합니다! 금색 트로피 예시에 더해, 몇 년 전에 출시한 생성형 예술 프로젝트의 또 다른 예시가 있습니다.

VIDEO
이 작은 고양이는 잠시 후 화면에 걸어 들어옵니다. 마우스를 올리면 Bluesky에서 저를 팔로우하라고 권합니다.

매우 엉뚱한 예시이지만, 스프라이트가 애니메이션 GIF에 비해 얼마나 더 강력할 수 있는지 잘 보여준다고 생각합니다. 훨씬 더 동적으로 만들 수 있습니다. 예를 들어, 한동안 상호작용하지 않으면 고양이가 잠들어 버립니다.

VIDEO
잠자는 동안에는 더 긴 animation-duration을 적용해 호흡이 느려집니다!

이 기법은 요즘 웹에서는 드물게 사용되지만, 비디오 게임에서는 항상 사용됩니다. 온라인에서 많은 스프라이트시트를 구할 수 있습니다. 이 기법을 사용해 작은 소닉이나 록맨이 사이트를 가로질러 달리게 할 수 있습니다! (JOSH W COMEAU는 NINTENDO®, SEGA®, CAPCOM® 등 회사 또는 개인이 소유한 지적 재산의 사용으로 인한 저작권 침해에 대해 어떠한 책임도 지지 않습니다.)

그리고 최고 수준의 애니메이션과 인터렉션을 만드는 방법을 배우고 싶다면, 제 출시 예정 강좌를 확인해 보세요.



이 강좌에서는 제 작업에서 차세대 애니메이션과 인터렉션을 만드는 데 사용하는 기본 기법을 가르칩니다. "좋아요" 버튼은 수많은 예시 중 하나일 뿐입니다. 이 블로그의 무언가가 어떻게 동작하는지 궁금했다면, 강좌에서 다룰 가능성이 매우 높습니다! ✨

Whimsical Animations는 여름 전에 출시될 예정이며, 업데이트를 구독하는 분들을 위한 특별 할인이 있을 수 있습니다. 😉