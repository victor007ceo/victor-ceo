import svgPaths from "./svg-sckvbbguai";
import imgP from "figma:asset/bd3b6e1849c33ec7196a4b5a8492b005a1514534.png";

function P() {
  return (
    <div className="absolute h-[800px] left-0 top-0 w-[600px]" data-name="P">
      <img alt="" className="absolute inset-0 max-w-none object-contain pointer-events-none size-full" src={imgP} />
    </div>
  );
}

function Container1() {
  return <div className="absolute border border-[rgba(255,255,255,0.12)] border-solid h-[197px] left-0 rounded-[48px] top-0 w-[502px]" data-name="Container" />;
}

function Vector() {
  return (
    <div className="absolute contents inset-[0_22.34%_0_0]" data-name="Vector">
      <div className="absolute inset-[2.04%_71.14%_0_0]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 57.1428 68.5714">
          <path d={svgPaths.p28f6280} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[2.04%_38.26%_0_32.88%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 57.1427 68.5714">
          <path d={svgPaths.p3354df00} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[0_22.34%_80.82%_70.88%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.426 13.4266">
          <path d={svgPaths.p3a923e00} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute contents inset-[0_22.34%_0_0]">
      <Vector />
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[70px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Frame1 />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex flex-col h-[70px] items-start left-[42px] top-[28px] w-[198px]" data-name="Container">
      <Icon />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[18px] left-0 top-0 w-[83.531px]" data-name="Paragraph">
      <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[#e2e2e2] text-[18px] top-0 tracking-[-0.36px] uppercase whitespace-nowrap">12:43 PM</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px opacity-60 relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[#e2e2e2] text-[18px] top-0 tracking-[-0.36px] uppercase whitespace-nowrap">Atlanta, Ga</p>
      </div>
    </div>
  );
}

function U() {
  return (
    <div className="absolute content-stretch flex h-[18px] items-center left-0 top-[25px] w-[114.844px]" data-name="U">
      <Paragraph1 />
    </div>
  );
}

function Q() {
  return (
    <div className="absolute h-[43px] left-0 top-0 w-[114.844px]" data-name="q">
      <Paragraph />
      <U />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="absolute h-[18px] left-0 top-0 w-[73.094px]" data-name="Paragraph">
      <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[#e2e2e2] text-[18px] top-0 tracking-[-0.36px] uppercase whitespace-nowrap">Tuesday</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[18px] opacity-60 relative shrink-0 w-[62.641px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[#e2e2e2] text-[18px] top-0 tracking-[-0.36px] uppercase whitespace-nowrap">oct 10</p>
      </div>
    </div>
  );
}

function K() {
  return (
    <div className="absolute content-stretch flex h-[18px] items-center justify-end left-0 top-[25px] w-[73.094px]" data-name="K">
      <Paragraph3 />
    </div>
  );
}

function D() {
  return (
    <div className="absolute h-[43px] left-[344.91px] top-0 w-[73.094px]" data-name="D">
      <Paragraph2 />
      <K />
    </div>
  );
}

function Y() {
  return (
    <div className="absolute h-[43px] left-[42px] top-[126px] w-[418px]" data-name="Y">
      <Q />
      <D />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute contents inset-[14.58%_0_10.42%_0]">
      <div className="absolute inset-[14.58%_0_10.42%_0]" data-name="Union">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 15.75">
          <path d={svgPaths.p3559100} fill="var(--fill-0, white)" id="Union" />
        </svg>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[21px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Frame />
    </div>
  );
}

function W() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[439px] size-[21px] top-[28px]" data-name="W">
      <Icon1 />
    </div>
  );
}

function X() {
  return (
    <div className="bg-[rgba(81,81,81,0.24)] h-[197px] relative rounded-[48px] shrink-0 w-full" data-name="X">
      <Container1 />
      <Container2 />
      <Y />
      <W />
    </div>
  );
}

function Container3() {
  return <div className="absolute border border-[rgba(255,255,255,0.12)] border-solid h-[417px] left-0 rounded-[48px] top-0 w-[502px]" data-name="Container" />;
}

function Locations() {
  return (
    <div className="absolute contents inset-[0_0.59%_0_0]" data-name="locations">
      <div className="absolute inset-[0_92.11%_0_0]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9285 18">
          <path d={svgPaths.p2608c9f0} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[0_80.67%_0_9.47%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9106 18">
          <path d={svgPaths.p17d4800} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[0_69.23%_0_20.91%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9106 18">
          <path d={svgPaths.p19e37080} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[0_57.79%_0_32.35%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9106 18">
          <path d={svgPaths.p3f6b0480} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[0_46.35%_0_43.78%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9106 18">
          <path d={svgPaths.p34eaed70} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[0_36.88%_0_57.2%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8.94634 18">
          <path d={svgPaths.p6a3ffe0} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[0_23.47%_0_66.66%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9106 18">
          <path d={svgPaths.p11444000} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[0_12.03%_0_78.1%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9106 18">
          <path d={svgPaths.p1a917c0} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[0_0.59%_0_89.54%]" data-name="Vector">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.9106 18">
          <path d={svgPaths.p19457000} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[18px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Locations />
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex flex-col h-[18px] items-start left-[42px] top-[35px] w-[151.094px]" data-name="Container">
      <Icon2 />
    </div>
  );
}

function Container5() {
  return <div className="absolute border-[rgba(255,255,255,0.16)] border-b border-solid h-[56px] left-0 top-0 w-[418px]" data-name="Container" />;
}

function Group() {
  return (
    <div className="absolute contents inset-[4.17%]">
      <div className="absolute inset-[4.17%]">
        <div className="absolute inset-[-4.55%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
            <path d={svgPaths.p39249a00} id="Ellipse 2" stroke="var(--stroke-0, white)" strokeWidth="0.875" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="h-[10.5px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group />
    </div>
  );
}

function J() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[5.25px] size-[10.5px] top-[5.25px]" data-name="J">
      <Icon3 />
    </div>
  );
}

function C() {
  return (
    <div className="absolute left-0 size-[21px] top-[10.5px]" data-name="C1">
      <J />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-white top-0 tracking-[-0.36px] uppercase whitespace-nowrap">new york</p>
      </div>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[18px] relative shrink-0 w-[52.203px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-[rgba(255,255,255,0.32)] top-0 tracking-[-0.36px] uppercase whitespace-nowrap">+0Hrs</p>
      </div>
    </div>
  );
}

function E1() {
  return (
    <div className="absolute content-stretch flex gap-[3.5px] h-[18px] items-center left-[28px] top-[12px] w-[139.234px]" data-name="e1">
      <Paragraph4 />
      <Paragraph5 />
    </div>
  );
}

function T() {
  return (
    <div className="absolute h-[42px] left-0 top-[7px] w-[167.234px]" data-name="t1">
      <C />
      <E1 />
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-white top-0 tracking-[-0.36px] uppercase whitespace-nowrap">12:43 PM</p>
      </div>
    </div>
  );
}

function R() {
  return (
    <div className="absolute content-stretch flex h-[18px] items-center left-[334.47px] top-[19px] w-[83.531px]" data-name="r1">
      <Paragraph6 />
    </div>
  );
}

function L() {
  return (
    <div className="absolute h-[56px] left-0 top-0 w-[418px]" data-name="L1">
      <Container5 />
      <T />
      <R />
    </div>
  );
}

function Container6() {
  return <div className="absolute border-[rgba(255,255,255,0.16)] border-b border-solid h-[56px] left-0 top-0 w-[418px]" data-name="Container" />;
}

function Group1() {
  return (
    <div className="absolute contents inset-[4.17%]">
      <div className="absolute inset-[4.17%]">
        <div className="absolute inset-[-4.55%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
            <path d={svgPaths.p39249a00} id="Ellipse 2" stroke="var(--stroke-0, white)" strokeWidth="0.875" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon4() {
  return (
    <div className="h-[10.5px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group1 />
    </div>
  );
}

function H() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[5.25px] size-[10.5px] top-[5.25px]" data-name="H1">
      <Icon4 />
    </div>
  );
}

function N() {
  return (
    <div className="absolute left-0 size-[21px] top-[10.5px]" data-name="n1">
      <H />
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-white top-0 tracking-[-0.36px] uppercase whitespace-nowrap">Los angeles</p>
      </div>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[18px] relative shrink-0 w-[52.203px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-[rgba(255,255,255,0.32)] top-0 tracking-[-0.36px] uppercase whitespace-nowrap">-3Hrs</p>
      </div>
    </div>
  );
}

function A() {
  return (
    <div className="absolute content-stretch flex gap-[3.5px] h-[18px] items-center left-[28px] top-[12px] w-[170.547px]" data-name="a1">
      <Paragraph7 />
      <Paragraph8 />
    </div>
  );
}

function I1() {
  return (
    <div className="absolute h-[42px] left-0 top-[7px] w-[198.547px]" data-name="i1">
      <N />
      <A />
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-white top-0 tracking-[-0.36px] uppercase whitespace-nowrap">9:43 AM</p>
      </div>
    </div>
  );
}

function S() {
  return (
    <div className="absolute content-stretch flex h-[18px] items-center left-[344.91px] top-[19px] w-[73.094px]" data-name="s1">
      <Paragraph9 />
    </div>
  );
}

function L1() {
  return (
    <div className="absolute h-[56px] left-0 top-[56px] w-[418px]" data-name="l1">
      <Container6 />
      <I1 />
      <S />
    </div>
  );
}

function Container7() {
  return <div className="absolute border-[rgba(255,255,255,0.16)] border-b border-solid h-[56px] left-0 top-0 w-[418px]" data-name="Container" />;
}

function Group2() {
  return (
    <div className="absolute contents inset-[4.17%]">
      <div className="absolute inset-[4.17%]">
        <div className="absolute inset-[-4.55%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
            <path d={svgPaths.p39249a00} id="Ellipse 2" stroke="var(--stroke-0, white)" strokeWidth="0.875" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="h-[10.5px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group2 />
    </div>
  );
}

function O2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[5.25px] size-[10.5px] top-[5.25px]" data-name="o1">
      <Icon5 />
    </div>
  );
}

function M() {
  return (
    <div className="absolute left-0 size-[21px] top-[10.5px]" data-name="M1">
      <O2 />
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-white top-0 tracking-[-0.36px] uppercase whitespace-nowrap">Mexico city</p>
      </div>
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="h-[18px] relative shrink-0 w-[52.203px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-[rgba(255,255,255,0.32)] top-0 tracking-[-0.36px] uppercase whitespace-nowrap">-1Hrs</p>
      </div>
    </div>
  );
}

function Z() {
  return (
    <div className="absolute content-stretch flex gap-[3.5px] h-[18px] items-center left-[28px] top-[12px] w-[170.547px]" data-name="Z1">
      <Paragraph10 />
      <Paragraph11 />
    </div>
  );
}

function D1() {
  return (
    <div className="absolute h-[42px] left-0 top-[7px] w-[198.547px]" data-name="d1">
      <M />
      <Z />
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-white top-0 tracking-[-0.36px] uppercase whitespace-nowrap">11:43 AM</p>
      </div>
    </div>
  );
}

function F() {
  return (
    <div className="absolute content-stretch flex h-[18px] items-center left-[334.47px] top-[19px] w-[83.531px]" data-name="f1">
      <Paragraph12 />
    </div>
  );
}

function P2() {
  return (
    <div className="absolute h-[56px] left-0 top-[112px] w-[418px]" data-name="p1">
      <Container7 />
      <D1 />
      <F />
    </div>
  );
}

function Container8() {
  return <div className="absolute border-[rgba(255,255,255,0.16)] border-b border-solid h-[56px] left-0 top-0 w-[418px]" data-name="Container" />;
}

function Group3() {
  return (
    <div className="absolute contents inset-[4.17%]">
      <div className="absolute inset-[4.17%]">
        <div className="absolute inset-[-4.55%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
            <path d={svgPaths.p39249a00} id="Ellipse 2" stroke="var(--stroke-0, white)" strokeWidth="0.875" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon6() {
  return (
    <div className="h-[10.5px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group3 />
    </div>
  );
}

function U1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[5.25px] size-[10.5px] top-[5.25px]" data-name="u1">
      <Icon6 />
    </div>
  );
}

function X1() {
  return (
    <div className="absolute left-0 size-[21px] top-[10.5px]" data-name="x1">
      <U1 />
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-white top-0 tracking-[-0.36px] uppercase whitespace-nowrap">London</p>
      </div>
    </div>
  );
}

function Paragraph14() {
  return (
    <div className="h-[18px] relative shrink-0 w-[52.203px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-[rgba(255,255,255,0.32)] top-0 tracking-[-0.36px] uppercase whitespace-nowrap">+5Hrs</p>
      </div>
    </div>
  );
}

function M1() {
  return (
    <div className="absolute content-stretch flex gap-[3.5px] h-[18px] items-center left-[28px] top-[12px] w-[118.344px]" data-name="m1">
      <Paragraph13 />
      <Paragraph14 />
    </div>
  );
}

function V() {
  return (
    <div className="absolute h-[42px] left-0 top-[7px] w-[146.344px]" data-name="v1">
      <X1 />
      <M1 />
    </div>
  );
}

function Paragraph15() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-white top-0 tracking-[-0.36px] uppercase whitespace-nowrap">5:43 pm</p>
      </div>
    </div>
  );
}

function B() {
  return (
    <div className="absolute content-stretch flex h-[18px] items-center left-[344.91px] top-[19px] w-[73.094px]" data-name="b1">
      <Paragraph15 />
    </div>
  );
}

function G() {
  return (
    <div className="absolute h-[56px] left-0 top-[168px] w-[418px]" data-name="g1">
      <Container8 />
      <V />
      <B />
    </div>
  );
}

function Container9() {
  return <div className="absolute border-[rgba(255,255,255,0.16)] border-b border-solid h-[56px] left-0 top-0 w-[418px]" data-name="Container" />;
}

function Group4() {
  return (
    <div className="absolute contents inset-[4.17%]">
      <div className="absolute inset-[4.17%]">
        <div className="absolute inset-[-4.55%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
            <path d={svgPaths.p39249a00} id="Ellipse 2" stroke="var(--stroke-0, white)" strokeWidth="0.875" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon7() {
  return (
    <div className="h-[10.5px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group4 />
    </div>
  );
}

function W1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[5.25px] size-[10.5px] top-[5.25px]" data-name="w1">
      <Icon7 />
    </div>
  );
}

function N1() {
  return (
    <div className="absolute left-0 size-[21px] top-[10.5px]" data-name="N1">
      <W1 />
    </div>
  );
}

function Paragraph16() {
  return (
    <div className="h-[18px] relative shrink-0 w-[52.203px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-white top-0 tracking-[-0.36px] uppercase whitespace-nowrap">Paris</p>
      </div>
    </div>
  );
}

function Paragraph17() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-[rgba(255,255,255,0.32)] top-0 tracking-[-0.36px] uppercase whitespace-nowrap">+6Hrs</p>
      </div>
    </div>
  );
}

function Y1() {
  return (
    <div className="absolute content-stretch flex gap-[3.5px] h-[18px] items-center left-[28px] top-[12px] w-[107.906px]" data-name="y1">
      <Paragraph16 />
      <Paragraph17 />
    </div>
  );
}

function Component() {
  return (
    <div className="absolute h-[42px] left-0 top-[7px] w-[135.906px]" data-name="_1">
      <N1 />
      <Y1 />
    </div>
  );
}

function Paragraph18() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-white top-0 tracking-[-0.36px] uppercase whitespace-nowrap">6:43 PM</p>
      </div>
    </div>
  );
}

function S1() {
  return (
    <div className="absolute content-stretch flex h-[18px] items-center left-[344.91px] top-[19px] w-[73.094px]" data-name="S1">
      <Paragraph18 />
    </div>
  );
}

function F1() {
  return (
    <div className="absolute h-[56px] left-0 top-[224px] w-[418px]" data-name="F1">
      <Container9 />
      <Component />
      <S1 />
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents inset-[4.17%]">
      <div className="absolute inset-[4.17%]">
        <div className="absolute inset-[-4.55%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10.5 10.5">
            <path d={svgPaths.p39249a00} id="Ellipse 2" stroke="var(--stroke-0, white)" strokeWidth="0.875" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon8() {
  return (
    <div className="h-[10.5px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group5 />
    </div>
  );
}

function R1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[5.25px] size-[10.5px] top-[5.25px]" data-name="R1">
      <Icon8 />
    </div>
  );
}

function A1() {
  return (
    <div className="absolute left-0 size-[21px] top-[10.5px]" data-name="A1">
      <R1 />
    </div>
  );
}

function Paragraph19() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-white top-0 tracking-[-0.36px] uppercase whitespace-nowrap">Madrid</p>
      </div>
    </div>
  );
}

function Paragraph20() {
  return (
    <div className="h-[18px] relative shrink-0 w-[52.203px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-[rgba(255,255,255,0.32)] top-0 tracking-[-0.36px] uppercase whitespace-nowrap">-5Hrs</p>
      </div>
    </div>
  );
}

function G1() {
  return (
    <div className="absolute content-stretch flex gap-[3.5px] h-[18px] items-center left-[28px] top-[12px] w-[118.344px]" data-name="G1">
      <Paragraph19 />
      <Paragraph20 />
    </div>
  );
}

function B1() {
  return (
    <div className="absolute h-[42px] left-0 top-[7px] w-[146.344px]" data-name="B1">
      <A1 />
      <G1 />
    </div>
  );
}

function Paragraph21() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Geist_Mono:Regular',sans-serif] font-normal leading-[18px] left-0 text-[18px] text-white top-0 tracking-[-0.36px] uppercase whitespace-nowrap">5:43 pm</p>
      </div>
    </div>
  );
}

function Z1() {
  return (
    <div className="absolute content-stretch flex h-[18px] items-center left-[344.91px] top-[19px] w-[73.094px]" data-name="z1">
      <Paragraph21 />
    </div>
  );
}

function T1() {
  return (
    <div className="absolute h-[56px] left-0 top-[280px] w-[418px]" data-name="T1">
      <B1 />
      <Z1 />
    </div>
  );
}

function E() {
  return (
    <div className="absolute h-[336px] left-0 top-0 w-[418px]" data-name="E1">
      <L />
      <L1 />
      <P2 />
      <G />
      <F1 />
      <T1 />
    </div>
  );
}

function P1() {
  return (
    <div className="absolute h-[336px] left-[42px] top-[67px] w-[418px]" data-name="P1">
      <E />
    </div>
  );
}

function O1() {
  return (
    <div className="bg-[rgba(81,81,81,0.24)] h-[417px] relative rounded-[48px] shrink-0 w-full" data-name="O1">
      <Container3 />
      <Container4 />
      <P1 />
    </div>
  );
}

function I() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[218px] h-[800px] items-start left-[-0.92px] pt-[28px] px-[49px] top-0 w-[600px]" data-name="I1">
      <X />
      <O1 />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bg-black border border-[#d1d5dc] border-solid h-[800px] left-[475.5px] overflow-clip top-[35px] w-[600px]" data-name="Container">
      <P />
      <I />
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute content-stretch flex h-[17.5px] items-start left-[14px] top-[14px] w-[355.891px]" data-name="Heading 3">
      <p className="flex-[1_0_0] font-['Segoe_UI:Medium',sans-serif] leading-[17.5px] min-h-px min-w-px not-italic relative text-[#1e2939] text-[12.25px]">Spectral Controls</p>
    </div>
  );
}

function ColorPicker() {
  return (
    <div className="relative rounded-[3.5px] shrink-0 size-[28px]" data-name="Color Picker">
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[3.5px]" />
    </div>
  );
}

function Text() {
  return (
    <div className="h-[14px] relative shrink-0 w-[42.672px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Segoe_UI:Regular',sans-serif] leading-[14px] not-italic relative shrink-0 text-[#4a5565] text-[10.5px] whitespace-nowrap">Hue Shift</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex gap-[7px] h-[28px] items-center relative shrink-0 w-full" data-name="Container">
      <ColorPicker />
      <Text />
    </div>
  );
}

function ColorPicker1() {
  return (
    <div className="relative rounded-[3.5px] shrink-0 size-[28px]" data-name="Color Picker">
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[3.5px]" />
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[14px] relative shrink-0 w-[47.609px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Segoe_UI:Regular',sans-serif] leading-[14px] not-italic relative shrink-0 text-[#4a5565] text-[10.5px] whitespace-nowrap">Saturation</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex gap-[7px] h-[28px] items-center relative shrink-0 w-full" data-name="Container">
      <ColorPicker1 />
      <Text1 />
    </div>
  );
}

function ColorPicker2() {
  return (
    <div className="relative rounded-[3.5px] shrink-0 size-[28px]" data-name="Color Picker">
      <div aria-hidden="true" className="absolute border border-[#d1d5dc] border-solid inset-0 pointer-events-none rounded-[3.5px]" />
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[14px] relative shrink-0 w-[48.25px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="font-['Segoe_UI:Regular',sans-serif] leading-[14px] not-italic relative shrink-0 text-[#4a5565] text-[10.5px] whitespace-nowrap">Brightness</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex gap-[7px] h-[28px] items-center relative shrink-0 w-full" data-name="Container">
      <ColorPicker2 />
      <Text2 />
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[10.5px] h-[105px] items-start left-[14px] top-[42px] w-[355.891px]" data-name="Container">
      <Container11 />
      <Container12 />
      <Container13 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex h-[14px] items-start relative shrink-0 w-full" data-name="Heading 4">
      <p className="flex-[1_0_0] font-['Segoe_UI:Medium',sans-serif] leading-[14px] min-h-px min-w-px not-italic relative text-[#364153] text-[10.5px]">Presets</p>
    </div>
  );
}

function Button() {
  return (
    <div className="h-[21px] relative rounded-[3.5px] shrink-0 w-full" data-name="Button">
      <div className="content-stretch flex items-start px-[7px] py-[3.5px] relative size-full">
        <p className="flex-[1_0_0] font-['Segoe_UI:Regular',sans-serif] leading-[14px] min-h-px min-w-px not-italic relative text-[#364153] text-[10.5px]">Original</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="h-[21px] relative rounded-[3.5px] shrink-0 w-full" data-name="Button">
      <div className="content-stretch flex items-start px-[7px] py-[3.5px] relative size-full">
        <p className="flex-[1_0_0] font-['Segoe_UI:Regular',sans-serif] leading-[14px] min-h-px min-w-px not-italic relative text-[#364153] text-[10.5px]">Warm Shift</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="h-[21px] relative rounded-[3.5px] shrink-0 w-full" data-name="Button">
      <div className="content-stretch flex items-start px-[7px] py-[3.5px] relative size-full">
        <p className="flex-[1_0_0] font-['Segoe_UI:Regular',sans-serif] leading-[14px] min-h-px min-w-px not-italic relative text-[#364153] text-[10.5px]">Cool Shift</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="h-[21px] relative rounded-[3.5px] shrink-0 w-full" data-name="Button">
      <div className="content-stretch flex items-start px-[7px] py-[3.5px] relative size-full">
        <p className="flex-[1_0_0] font-['Segoe_UI:Regular',sans-serif] leading-[14px] min-h-px min-w-px not-italic relative text-[#364153] text-[10.5px]">Vibrant</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="h-[21px] relative rounded-[3.5px] shrink-0 w-full" data-name="Button">
      <div className="content-stretch flex items-start px-[7px] py-[3.5px] relative size-full">
        <p className="flex-[1_0_0] font-['Segoe_UI:Regular',sans-serif] leading-[14px] min-h-px min-w-px not-italic relative text-[#364153] text-[10.5px]">Muted</p>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="h-[21px] relative rounded-[3.5px] shrink-0 w-full" data-name="Button">
      <div className="content-stretch flex items-start px-[7px] py-[3.5px] relative size-full">
        <p className="flex-[1_0_0] font-['Segoe_UI:Regular',sans-serif] leading-[14px] min-h-px min-w-px not-italic relative text-[#364153] text-[10.5px]">Sunset</p>
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="h-[21px] relative rounded-[3.5px] shrink-0 w-full" data-name="Button">
      <div className="content-stretch flex items-start px-[7px] py-[3.5px] relative size-full">
        <p className="flex-[1_0_0] font-['Segoe_UI:Regular',sans-serif] leading-[14px] min-h-px min-w-px not-italic relative text-[#364153] text-[10.5px]">Ocean</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col gap-[5px] h-[178.5px] items-start pt-[1.5px] relative shrink-0 w-full" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
      <Button5 />
      <Button6 />
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[7px] h-[199.5px] items-start left-[14px] top-[161px] w-[355.891px]" data-name="Container">
      <Heading1 />
      <Container15 />
    </div>
  );
}

function O() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.9)] border border-[#d1d5dc] border-solid h-[376.5px] left-[28px] rounded-[8.75px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] top-[28px] w-[385.891px]" data-name="O">
      <Heading />
      <Container10 />
      <Container14 />
    </div>
  );
}

function Q1() {
  return (
    <div className="bg-[#f3f4f6] h-[870px] relative shrink-0 w-full" data-name="q1">
      <Container />
      <O />
    </div>
  );
}

export default function ShaderDashCommunityCopy() {
  return (
    <div className="bg-white content-stretch flex flex-col items-start relative size-full" data-name="Shader Dash (Community) (Copy)">
      <Q1 />
    </div>
  );
}