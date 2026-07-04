import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{n,t as r}from"./RzLink-DOB7efEQ.js";import{n as i,t as a}from"./dist-CdonmI8K.js";var o,s,c,l=e((()=>{o=`_rz-table_1dgkc_1`,s=`_rz-table-actions_1dgkc_13`,c={"rz-table":`_rz-table_1dgkc_1`,rzTable:o,"rz-table-actions":`_rz-table-actions_1dgkc_13`,rzTableActions:s}}));function u({columns:e,data:t,rowIndex:n=`id`,userPermissions:i}){return(0,d.jsxs)(`table`,{className:c.rzTable,children:[(0,d.jsx)(`thead`,{children:(0,d.jsx)(`tr`,{children:e.map(e=>(0,d.jsx)(`th`,{children:e.label},e.key))})}),(0,d.jsx)(`tbody`,{children:t.map(t=>(0,d.jsx)(`tr`,{children:e.map(e=>e.actions?(0,d.jsx)(`td`,{className:c.rzTableActions,children:e.actions.map(n=>{if(n.type===`link`){let e=n.hrefProp||`link`,a=String(t[e]);return(0,d.jsx)(r,{userPermissions:i,href:a,...n},a)}else return(0,d.jsx)(`button`,{type:`button`,onClick:()=>n.handler?.(String(t[e.key]),t),children:n.label},String(n.handler))})},e.key):(0,d.jsx)(`td`,{children:e.render?e.render(String(t[e.key]),t):String(t[e.key])},e.key))},t[n]))})]})}var d,f=e((()=>{n(),l(),d=t(),u.__docgenInfo={description:``,methods:[],displayName:`RzTable`,props:{columns:{required:!0,tsType:{name:`Array`,elements:[{name:`RzTableColumn`}],raw:`RzTableColumn[]`},description:``},data:{required:!0,tsType:{name:`Array`,elements:[{name:`T`}],raw:`T[]`},description:``},rowIndex:{required:!1,tsType:{name:`T`},description:``,defaultValue:{value:`'id'`,computed:!1}},userPermissions:{required:!0,tsType:{name:`Array`,elements:[{name:`Permission`}],raw:`Permission[]`},description:``}}}})),p,m,h,g,_,v,y,b,x,S,C;e((()=>{i(),f(),p=t(),m={component:u},h=[{key:`name`,label:`Name`},{key:`season`,label:`Season`},{key:`time`,label:`Prep Time`}],g=[{id:`1`,name:`Summer Pasta`,season:`Summer`,time:`30 min`},{id:`2`,name:`Roasted Squash Soup`,season:`Autumn`,time:`45 min`},{id:`3`,name:`Spring Salad`,season:`Spring`,time:`15 min`}],_={args:{columns:h,data:g,userPermissions:[`recipes:read`,`__controls:read`]}},v={args:{columns:h,data:[],userPermissions:[`recipes:read`]}},y={args:{columns:[...h,{key:`actions`,label:`Actions`,actions:[{type:`link`,hrefProp:`editUrl`,label:`Edit`,requiredPermission:`recipes:update`}]}],data:g.map(e=>({...e,editUrl:`/recipes/${e.id}/edit`})),userPermissions:[`recipes:read`,`recipes:update`]}},b={args:{columns:[...h,{key:`actions`,label:`Actions`,actions:[{type:`button`,label:`Delete`,requiredPermission:`recipes:delete`,handler:a()}]}],data:g,userPermissions:[`recipes:read`,`recipes:delete`]}},x={args:{columns:[...h,{key:`actions`,label:`Actions`,actions:[{type:`link`,hrefProp:`editUrl`,label:`Edit`,requiredPermission:`recipes:update`}]}],data:g.map(e=>({...e,editUrl:`/recipes/${e.id}/edit`})),userPermissions:[`recipes:read`]}},S={args:{columns:[{key:`name`,label:`Name`},{key:`season`,label:`Season`},{key:`time`,label:`Prep Time`,render:e=>(0,p.jsx)(`strong`,{children:e})}],data:g,userPermissions:[`recipes:read`]}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    columns,
    data,
    userPermissions: ['recipes:read', '__controls:read']
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    columns,
    data: [],
    userPermissions: ['recipes:read']
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    columns: [...columns, {
      key: 'actions',
      label: 'Actions',
      actions: [{
        type: 'link' as const,
        hrefProp: 'editUrl',
        label: 'Edit',
        requiredPermission: 'recipes:update' as const
      }]
    }],
    data: data.map(item => ({
      ...item,
      editUrl: \`/recipes/\${item.id}/edit\`
    })),
    userPermissions: ['recipes:read', 'recipes:update']
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    columns: [...columns, {
      key: 'actions',
      label: 'Actions',
      actions: [{
        type: 'button' as const,
        label: 'Delete',
        requiredPermission: 'recipes:delete' as const,
        handler: fn()
      }]
    }],
    data,
    userPermissions: ['recipes:read', 'recipes:delete']
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    columns: [...columns, {
      key: 'actions',
      label: 'Actions',
      actions: [{
        type: 'link' as const,
        hrefProp: 'editUrl',
        label: 'Edit',
        requiredPermission: 'recipes:update' as const
      }]
    }],
    data: data.map(item => ({
      ...item,
      editUrl: \`/recipes/\${item.id}/edit\`
    })),
    userPermissions: ['recipes:read']
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    columns: [{
      key: 'name',
      label: 'Name'
    }, {
      key: 'season',
      label: 'Season'
    }, {
      key: 'time',
      label: 'Prep Time',
      render: (val: string) => <strong>{val}</strong>
    }],
    data,
    userPermissions: ['recipes:read']
  }
}`,...S.parameters?.docs?.source}}},C=[`Default`,`Empty`,`WithEditAction`,`WithButtonAction`,`ActionsHidden`,`WithCustomRender`]}))();export{x as ActionsHidden,_ as Default,v as Empty,b as WithButtonAction,S as WithCustomRender,y as WithEditAction,C as __namedExportsOrder,m as default};