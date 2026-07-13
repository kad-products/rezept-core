import{i as e}from"./preload-helper-BdFrVu1K.js";import{t}from"./jsx-runtime-f3rHp9ZU.js";import{n,t as r}from"./RzLink-ChE6K720.js";var i,a,o,s,c,l=e((()=>{i=`_rz-card_2vly5_1`,a=`_rz-card-title_2vly5_7`,o=`_rz-card-body_2vly5_13`,s=`_rz-card-actions_2vly5_17`,c={"rz-card":`_rz-card_2vly5_1`,rzCard:i,"rz-card-title":`_rz-card-title_2vly5_7`,rzCardTitle:a,"rz-card-body":`_rz-card-body_2vly5_13`,rzCardBody:o,"rz-card-actions":`_rz-card-actions_2vly5_17`,rzCardActions:s}}));function u({title:e,body:t,actions:n,userPermissions:i}){return(0,d.jsxs)(`div`,{className:c.rzCard,children:[(0,d.jsx)(`div`,{className:c.rzCardTitle,children:e}),t&&(0,d.jsx)(`div`,{className:c.rzCardBody,children:t}),(0,d.jsx)(`div`,{className:c.rzCardActions,children:n.map(e=>(0,d.jsx)(r,{userPermissions:i,...e},e.href))})]})}var d,f=e((()=>{n(),l(),d=t(),u.__docgenInfo={description:``,methods:[],displayName:`RzCard`,props:{title:{required:!0,tsType:{name:`string`},description:``},body:{required:!1,tsType:{name:`union`,raw:`string | React.ReactNode`,elements:[{name:`string`},{name:`ReactReactNode`,raw:`React.ReactNode`}]},description:``},actions:{required:!0,tsType:{name:`Array`,elements:[{name:`RzLinkType`}],raw:`RzLinkType[]`},description:``},userPermissions:{required:!0,tsType:{name:`Array`,elements:[{name:`Permission`}],raw:`Permission[]`},description:``}}}})),p,m,h,g,_,v,y,b;e((()=>{f(),p=t(),m={component:u},h={args:{title:`Summer Pasta`,userPermissions:[`recipes:read`,`__controls:read`],actions:[{href:`/recipes/1`,label:`View`,requiredPermission:`__controls:read`},{href:`/recipes/1/edit`,label:`Edit`,requiredPermission:`recipes:update`}]}},g={args:{title:`Roasted Squash Soup`,body:`A warming autumn soup made with butternut squash, roasted garlic, and fresh thyme.`,userPermissions:[`recipes:read`,`__controls:read`,`recipes:update`],actions:[{href:`/recipes/2`,label:`View`,requiredPermission:`__controls:read`},{href:`/recipes/2/edit`,label:`Edit`,requiredPermission:`recipes:update`}]}},_={args:{title:`Spring Salad`,body:(0,p.jsxs)(`ul`,{children:[(0,p.jsx)(`li`,{children:`Mixed greens`}),(0,p.jsx)(`li`,{children:`Cherry tomatoes`}),(0,p.jsx)(`li`,{children:`Shaved fennel`}),(0,p.jsx)(`li`,{children:`Lemon vinaigrette`})]}),userPermissions:[`recipes:read`,`__controls:read`],actions:[{href:`/recipes/3`,label:`View`,requiredPermission:`__controls:read`}]}},v={args:{title:`Herb-Crusted Lamb`,body:`A classic spring roast with rosemary, mint, and garlic.`,userPermissions:[`recipes:read`],actions:[{href:`/recipes/4/edit`,label:`Edit`,requiredPermission:`recipes:update`}]}},y={args:{title:`Tomato Bruschetta`,body:`Grilled bread rubbed with garlic and topped with fresh tomatoes and basil.`,userPermissions:[`recipes:read`],actions:[]}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Summer Pasta',
    userPermissions: ['recipes:read', '__controls:read'],
    actions: [{
      href: '/recipes/1',
      label: 'View',
      requiredPermission: '__controls:read'
    }, {
      href: '/recipes/1/edit',
      label: 'Edit',
      requiredPermission: 'recipes:update'
    }]
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Roasted Squash Soup',
    body: 'A warming autumn soup made with butternut squash, roasted garlic, and fresh thyme.',
    userPermissions: ['recipes:read', '__controls:read', 'recipes:update'],
    actions: [{
      href: '/recipes/2',
      label: 'View',
      requiredPermission: '__controls:read'
    }, {
      href: '/recipes/2/edit',
      label: 'Edit',
      requiredPermission: 'recipes:update'
    }]
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Spring Salad',
    body: <ul>
                <li>Mixed greens</li>
                <li>Cherry tomatoes</li>
                <li>Shaved fennel</li>
                <li>Lemon vinaigrette</li>
            </ul>,
    userPermissions: ['recipes:read', '__controls:read'],
    actions: [{
      href: '/recipes/3',
      label: 'View',
      requiredPermission: '__controls:read'
    }]
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Herb-Crusted Lamb',
    body: 'A classic spring roast with rosemary, mint, and garlic.',
    userPermissions: ['recipes:read'],
    actions: [{
      href: '/recipes/4/edit',
      label: 'Edit',
      requiredPermission: 'recipes:update'
    }]
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    title: 'Tomato Bruschetta',
    body: 'Grilled bread rubbed with garlic and topped with fresh tomatoes and basil.',
    userPermissions: ['recipes:read'],
    actions: []
  }
}`,...y.parameters?.docs?.source}}},b=[`Default`,`WithBody`,`ReactNodeBody`,`ActionsHidden`,`NoActions`]}))();export{v as ActionsHidden,h as Default,y as NoActions,_ as ReactNodeBody,g as WithBody,b as __namedExportsOrder,m as default};