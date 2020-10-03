import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '../component/auth/auth.guard';
import { MainComponent } from '../component/main/main.component';
import { MessageComponent } from '../component/message/message.component';
const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    pathMatch: 'full',
    canActivate: [AuthGuard],
  },
  {
    path: 'v1',
    loadChildren: '../module/post.module#PostModule',
  },
  {
    path: 'auth',
    loadChildren: '../module/auth.module#AuthModule',
  },
  {
    path: 'messages',
    component: MessageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}
