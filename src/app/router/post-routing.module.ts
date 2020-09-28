import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewfeedComponent } from '../component/post/newfeed/newfeed.component';
import { PostCreateComponent } from '../component/post/postcreate/post-create.component';

const routes: Routes = [
  {
    path: 'create',
    component: PostCreateComponent,
  },
  {
    path: 'newfeed',
    component: NewfeedComponent,
  },
  {
    path: '',
    component: NewfeedComponent,
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostRoutingModule {}
