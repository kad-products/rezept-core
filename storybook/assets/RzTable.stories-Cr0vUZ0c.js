import{j as e}from"./jsx-runtime-u17CrQMm.js";import{R as k}from"./RzLink-BpQG8Ire.js";function c({columns:r,data:p,rowIndex:y="id"}){return e.jsxs("table",{className:"rz-table",children:[e.jsx("thead",{children:e.jsx("tr",{children:r.map(n=>e.jsx("th",{children:n.label},n.key))})}),e.jsx("tbody",{children:p.map(n=>e.jsx("tr",{children:r.map(a=>a.actions?e.jsx("td",{children:a.actions.map(s=>{if(s.type==="link"){const b=s.hrefProp||"link",d=String(n[b]);return e.jsx(k,{href:d,...s},d)}else return e.jsx("button",{type:"button",onClick:()=>s.handler?.(String(n[a.key]),n),children:s.label},String(s.handler))})},a.key):e.jsx("td",{children:a.render?a.render(String(n[a.key]),n):String(n[a.key])},a.key))},n[y]))})]})}c.__docgenInfo={description:"",methods:[],displayName:"RzTable",props:{columns:{required:!0,tsType:{name:"Array",elements:[{name:"RzTableColumn"}],raw:"RzTableColumn[]"},description:""},data:{required:!0,tsType:{name:"Array",elements:[{name:"T"}],raw:"T[]"},description:""},rowIndex:{required:!1,tsType:{name:"T"},description:"",defaultValue:{value:"'id'",computed:!1}}}};const S={component:c},u=[{key:"name",label:"Name"},{key:"season",label:"Season"},{key:"time",label:"Time"}],m=[{id:"1",name:"Summer Pasta",season:"Summer",time:"30 min"},{id:"2",name:"Roasted Squash Soup",season:"Autumn",time:"45 min"},{id:"3",name:"Spring Salad",season:"Spring",time:"15 min"}],t={args:{columns:u,data:m}},o={args:{columns:u,data:[]}},i={args:{columns:[{key:"name",label:"Name"},{key:"season",label:"Season"},{key:"time",label:"Time"},{key:"actions",label:"Actions",actions:[{type:"link",hrefProp:"editUrl",label:"Edit",requiredPermission:"seasons:update"}]}],data:m.map(r=>({...r,editUrl:`/edit/${r.id}`}))}},l={args:{columns:[{key:"name",label:"Name"},{key:"season",label:"Season"},{key:"time",label:"Time",render:r=>e.jsx("strong",{children:r})}],data:m}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    columns,
    data
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    columns,
    data: []
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
      label: 'Time'
    }, {
      key: 'actions',
      label: 'Actions',
      actions: [{
        type: 'link',
        hrefProp: 'editUrl',
        label: 'Edit',
        requiredPermission: 'seasons:update'
      }]
    }],
    data: data.map(item => ({
      ...item,
      editUrl: \`/edit/\${item.id}\`
    }))
  }
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}};const f=["Default","Empty","WithEditAction","WithCustomRender"];export{t as Default,o as Empty,l as WithCustomRender,i as WithEditAction,f as __namedExportsOrder,S as default};
