import{j as a}from"./jsx-runtime-u17CrQMm.js";function m({columns:r,data:i,rowIndex:u="id"}){return a.jsxs("table",{className:"rz-table",children:[a.jsx("thead",{children:r.map(e=>a.jsx("th",{children:e.label},e.key))}),a.jsx("tbody",{children:i.map(e=>a.jsx("tr",{children:r.map(n=>a.jsx("td",{children:n.render?n.render(String(e[n.key]),e):String(e[n.key])},n.key))},e[u]))})]})}m.__docgenInfo={description:"",methods:[],displayName:"RzTable",props:{columns:{required:!0,tsType:{name:"Array",elements:[{name:"RzTableColumn"}],raw:"RzTableColumn[]"},description:""},data:{required:!0,tsType:{name:"Array",elements:[{name:"T"}],raw:"T[]"},description:""},rowIndex:{required:!1,tsType:{name:"T"},description:"",defaultValue:{value:"'id'",computed:!1}}}};const p={component:m},l=[{key:"name",label:"Name"},{key:"season",label:"Season"},{key:"time",label:"Time"}],d=[{id:"1",name:"Summer Pasta",season:"Summer",time:"30 min"},{id:"2",name:"Roasted Squash Soup",season:"Autumn",time:"45 min"},{id:"3",name:"Spring Salad",season:"Spring",time:"15 min"}],s={args:{columns:l,data:d}},t={args:{columns:l,data:[]}},o={args:{columns:[{key:"name",label:"Name"},{key:"season",label:"Season"},{key:"time",label:"Time",render:r=>a.jsx("strong",{children:r})}],data:d}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    columns,
    data
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    columns,
    data: []
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    columns: [{
      key: 'name',
      label: 'Name'
    }, {
      key: 'season',
      label: 'Season'
    }, {
      key: 'time',
      label: 'Time',
      render: val => <strong>{val}</strong>
    }],
    data
  }
}`,...o.parameters?.docs?.source}}};const y=["Default","Empty","WithCustomRender"];export{s as Default,t as Empty,o as WithCustomRender,y as __namedExportsOrder,p as default};
