import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./dist-BNzV2tmc.js";function i({options:e,value:t,onChange:n}){return(0,a.jsx)(a.Fragment,{children:e.map(e=>(0,a.jsxs)(`label`,{children:[(0,a.jsx)(`input`,{type:`checkbox`,checked:t.includes(e.value),onChange:n,value:e.value}),e.label]},e.value))})}var a;function o(){return(o=e((()=>{a=t(),i.__docgenInfo={description:``,methods:[],displayName:`RzCheckboxGroup`,props:{options:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ value: string; label: string }`,signature:{properties:[{key:`value`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}}]}}],raw:`Array<{ value: string; label: string }>`},description:``},value:{required:!0,tsType:{name:`Array`,elements:[{name:`string`}],raw:`string[]`},description:``},onChange:{required:!0,tsType:{name:`ReactChangeEventHandler`,raw:`React.ChangeEventHandler<HTMLInputElement>`,elements:[{name:`HTMLInputElement`}]},description:``}}}})))()}var s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{n(),o(),s={component:i,parameters:{layout:`centered`}},c=[{value:`spring`,label:`Spring`},{value:`summer`,label:`Summer`},{value:`autumn`,label:`Autumn`},{value:`winter`,label:`Winter`}],l=[{value:`tomato`,label:`Tomato`},{value:`courgette`,label:`Courgette`},{value:`aubergine`,label:`Aubergine`},{value:`fennel`,label:`Fennel`},{value:`asparagus`,label:`Asparagus`},{value:`pea`,label:`Pea`},{value:`broad-bean`,label:`Broad Bean`},{value:`artichoke`,label:`Globe Artichoke`},{value:`beetroot`,label:`Beetroot`},{value:`spinach`,label:`Spinach`},{value:`kale`,label:`Kale`},{value:`leek`,label:`Leek`}],u={args:{options:c,value:[],onChange:r()}},d={args:{options:c,value:[`spring`,`summer`],onChange:r()}},f={args:{options:c,value:[`spring`,`summer`,`autumn`,`winter`],onChange:r()}},p={args:{options:l,value:[`tomato`,`fennel`,`kale`],onChange:r()}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    options: seasonOptions,
    value: [],
    onChange: fn()
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    options: seasonOptions,
    value: ['spring', 'summer'],
    onChange: fn()
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    options: seasonOptions,
    value: ['spring', 'summer', 'autumn', 'winter'],
    onChange: fn()
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    options: ingredientOptions,
    value: ['tomato', 'fennel', 'kale'],
    onChange: fn()
  }
}`,...p.parameters?.docs?.source}}},m=[`NoneChecked`,`SomeChecked`,`AllChecked`,`ManyOptions`]})))()}h();export{f as AllChecked,p as ManyOptions,u as NoneChecked,d as SomeChecked,m as __namedExportsOrder,s as default};