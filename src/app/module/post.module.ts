import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NewfeedComponent } from '../component/post/newfeed/newfeed.component';
import { PostCreateComponent } from '../component/post/postcreate/post-create.component';
import { PostRoutingModule } from '../router/post-routing.module';

@NgModule({
  declarations: [NewfeedComponent, PostCreateComponent],
  imports: [
    CommonModule,
    RouterModule,
    PostRoutingModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  exports: [NewfeedComponent, PostCreateComponent],
})
export class PostModule {}
