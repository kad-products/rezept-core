import{j as a}from"./jsx-runtime-u17CrQMm.js";function m({columns:r,data:c,rowIndex:p="id"}){return a.jsxs("table",{className:"rz-table",children:[a.jsx("thead",{children:a.jsx("tr",{children:r.map(n=>a.jsx("th",{children:n.label},n.key))})}),a.jsx("tbody",{children:c.map(n=>a.jsx("tr",{children:r.map(e=>{if(e.action){const u=e.action.hrefProp||"link",y=String(n[u]);if(e.action.type==="link")return a.jsx("td",{children:a.jsx("a",{href:y,children:e.action.label})},e.key)}return a.jsx("td",{children:e.render?e.render(String(n[e.key]),n):String(n[e.key])},e.key)})},n[p]))})]})}m.__docgenInfo={description:"",methods:[],displayName:"RzTable",props:{columns:{required:!0,tsType:{name:"Array",elements:[{name:"RzTableColumn"}],raw:"RzTableColumn[]"},description:""},data:{required:!0,tsType:{name:"Array",elements:[{name:"T"}],raw:"T[]"},description:""},rowIndex:{required:!1,tsType:{name:"T"},description:"",defaultValue:{value:"'id'",computed:!1}}}};const k={component:m},d=[{key:"name",label:"Name"},{key:"season",label:"Season"},{key:"time",label:"Time"}],l=[{id:"1",name:"Summer Pasta",season:"Summer",time:"30 min"},{id:"2",name:"Roasted Squash Soup",season:"Autumn",time:"45 min"},{id:"3",name:"Spring Salad",season:"Spring",time:"15 min"}],s={args:{columns:d,data:l}},t={args:{columns:d,data:[]}},o={args:{columns:[{key:"name",label:"Name"},{key:"season",label:"Season"},{key:"time",label:"Time"},{key:"actions",label:"Actions",action:{type:"link",hrefProp:"editUrl",label:"Edit"}}],data:l.map(r=>({...r,editUrl:`/edit/${r.id}`}))}},i={args:{columns:[{key:"name",label:"Name"},{key:"season",label:"Season"},{key:"time",label:"Time",render:r=>a.jsx("strong",{children:r})}],data:l}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
      label: 'Time'
    }, {
      key: 'actions',
      label: 'Actions',
      action: {
        type: 'link',
        hrefProp: 'editUrl',
        label: 'Edit'
      }
    }],
    data: data.map(item => ({
      ...item,
      editUrl: \`/edit/\${item.id}\`
    }))
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};const h=["Default","Empty","WithEditAction","WithCustomRender"];export{s as Default,t as Empty,i as WithCustomRender,o as WithEditAction,h as __namedExportsOrder,k as default};
