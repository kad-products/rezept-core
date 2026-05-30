import{j as e}from"./jsx-runtime-u17CrQMm.js";function n({title:i,body:s,actions:o}){return e.jsxs("div",{className:"rz-card",children:[e.jsx("div",{className:"rz-card-title",children:i}),s&&e.jsx("div",{className:"rz-card-body",children:s}),e.jsx("div",{className:"rz-card-actions",children:o.map(a=>e.jsx("a",{href:a.href,children:a.text},a.href))})]})}n.__docgenInfo={description:"",methods:[],displayName:"RzCard",props:{title:{required:!0,tsType:{name:"string"},description:""},body:{required:!1,tsType:{name:"union",raw:"string | React.ReactNode",elements:[{name:"string"},{name:"ReactReactNode",raw:"React.ReactNode"}]},description:""},actions:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
	href: string;
	text: string;
}`,signature:{properties:[{key:"href",value:{name:"string",required:!0}},{key:"text",value:{name:"string",required:!0}}]}}],raw:"CardAction[]"},description:""}}};const d={component:n},r={args:{title:"Summer Pasta",actions:[{href:"#",text:"View"}]}},t={args:{title:"Summer Pasta",body:"A light and fresh pasta dish with seasonal vegetables.",actions:[{href:"#",text:"View"}]}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Summer Pasta',
    actions: [{
      href: '#',
      text: 'View'
    }]
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Summer Pasta',
    body: 'A light and fresh pasta dish with seasonal vegetables.',
    actions: [{
      href: '#',
      text: 'View'
    }]
  }
}`,...t.parameters?.docs?.source}}};const m=["Default","WithBody"];export{r as Default,t as WithBody,m as __namedExportsOrder,d as default};
