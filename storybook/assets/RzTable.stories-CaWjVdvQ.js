import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{n,t as r}from"./RzLink-Dhnvj9EE.js";function i({columns:e,data:t,rowIndex:n=`id`,userPermissions:i}){return(0,a.jsxs)(`table`,{className:`rz-table`,children:[(0,a.jsx)(`thead`,{children:(0,a.jsx)(`tr`,{children:e.map(e=>(0,a.jsx)(`th`,{children:e.label},e.key))})}),(0,a.jsx)(`tbody`,{children:t.map(t=>(0,a.jsx)(`tr`,{children:e.map(e=>e.actions?(0,a.jsx)(`td`,{children:e.actions.map(n=>{if(n.type===`link`){let e=n.hrefProp||`link`,o=String(t[e]);return(0,a.jsx)(r,{permissions:i,href:o,...n},o)}else return(0,a.jsx)(`button`,{type:`button`,onClick:()=>n.handler?.(String(t[e.key]),t),children:n.label},String(n.handler))})},e.key):(0,a.jsx)(`td`,{children:e.render?e.render(String(t[e.key]),t):String(t[e.key])},e.key))},t[n]))})]})}var a,o=e((()=>{n(),a=t(),i.__docgenInfo={description:``,methods:[],displayName:`RzTable`,props:{columns:{required:!0,tsType:{name:`Array`,elements:[{name:`RzTableColumn`}],raw:`RzTableColumn[]`},description:``},data:{required:!0,tsType:{name:`Array`,elements:[{name:`T`}],raw:`T[]`},description:``},rowIndex:{required:!1,tsType:{name:`T`},description:``,defaultValue:{value:`'id'`,computed:!1}},userPermissions:{required:!0,tsType:{name:`Array`,elements:[{name:`Permission`}],raw:`Permission[]`},description:``}}}})),s,c,l,u,d,f,p,m,h;e((()=>{o(),s=t(),c={component:i},l=[{key:`name`,label:`Name`},{key:`season`,label:`Season`},{key:`time`,label:`Time`}],u=[{id:`1`,name:`Summer Pasta`,season:`Summer`,time:`30 min`},{id:`2`,name:`Roasted Squash Soup`,season:`Autumn`,time:`45 min`},{id:`3`,name:`Spring Salad`,season:`Spring`,time:`15 min`}],d={args:{columns:l,data:u}},f={args:{columns:l,data:[]}},p={args:{columns:[{key:`name`,label:`Name`},{key:`season`,label:`Season`},{key:`time`,label:`Time`},{key:`actions`,label:`Actions`,actions:[{type:`link`,hrefProp:`editUrl`,label:`Edit`,requiredPermission:`seasons:update`}]}],data:u.map(e=>({...e,editUrl:`/edit/${e.id}`}))}},m={args:{columns:[{key:`name`,label:`Name`},{key:`season`,label:`Season`},{key:`time`,label:`Time`,render:e=>(0,s.jsx)(`strong`,{children:e})}],data:u}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    columns,
    data
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    columns,
    data: []
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h=[`Default`,`Empty`,`WithEditAction`,`WithCustomRender`]}))();export{d as Default,f as Empty,m as WithCustomRender,p as WithEditAction,h as __namedExportsOrder,c as default};