<template>
  <q-layout view="hHh lpR fFf">

    <q-header class="bg-grey-10 text-white glossy text-center" height-hint="98" style="margin:0 auto;">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <q-icon name="hiking"/>
          </q-avatar>
          GIS Mobile App
        </q-toolbar-title>
      </q-toolbar>

      
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-grey-10 text-white glossy">
      <q-toolbar>
        <q-tabs style="margin:0 auto;">
          <q-route-tab to="/" label="Home" icon="home"/>
          <q-route-tab to="/connection"  label="Connection" icon="bluetooth"/>
          <q-route-tab to="/collection" label="Collection" icon="forest"/>
        </q-tabs>
      </q-toolbar>
    </q-footer>

  </q-layout>
</template>