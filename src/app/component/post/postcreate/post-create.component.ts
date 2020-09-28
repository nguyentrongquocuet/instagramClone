import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PostService } from 'src/app/service/post.service';
import { mimeType } from '../../../validator/mimetype.validator';
@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
})
export class PostCreateComponent implements OnInit {
  form: FormGroup;
  previewUrl = '';
  constructor(private postService: PostService) {
    this.form = new FormGroup({
      title: new FormControl(null, [Validators.required]),
      image: new FormControl(null, {
        validators: Validators.required,
        asyncValidators: [mimeType],
      }),
    });
  }

  onImagePicked(e: Event) {
    this.form.patchValue({
      image: (e.target as HTMLInputElement).files[0],
    });
    this.form.get('image').updateValueAndValidity();
    const fr = new FileReader();
    fr.addEventListener('loadend', () => {
      this.previewUrl = fr.result as string;
    });
    fr.readAsDataURL(this.form.value.image);
  }

  resetInput(e: Event) {
    (e.target as HTMLInputElement).value = null;
  }

  onAddPost() {
    this.postService
      .addPost(this.form.value.title, this.form.value.image)
      .subscribe((responseData) => {
        this.form.reset();
      });
  }

  ngOnInit() {}
}
