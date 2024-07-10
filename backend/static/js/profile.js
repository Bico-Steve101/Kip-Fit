    $(document).ready(function() {
        $('#updateButton').click(function() {
            Swal.fire({
                title: "Are you sure?",
                text: "You want to update your profile!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, update it!"
            }).then((result) => {
                if (result.isConfirmed) {
                    const formData = new FormData($('#profileForm')[0]);
                    $.ajax({
                        url: '/profile',
                        type: 'POST',
                        data: formData,
                        contentType: false,
                        processData: false,
                        success: function(response) {
                            Swal.fire({
                                title: "Updated!",
                                text: "Your profile has been updated.",
                                icon: "success"
                            }).then(() => {
                                // Update form fields with new data if they exist
                                $('input[name="firstName"]').val(response.firstName || '');
                                $('input[name="lastName"]').val(response.lastName || '');
                                $('input[name="username"]').val(response.username || '');
                                $('input[name="email"]').val(response.email || '');
                                
                                // Update profile section
                                $('.profile-name h4').text((response.firstName || '') + ' ' + (response.lastName || ''));
                                $('.profile-email h4').text(response.email || '');

                                // Update cover photo
                                if (response.coverImage) {
                                    $('.cover-photo').html('<img src="data:image/jpeg;base64,' + response.coverImage + '" class="img-fluid" alt="Cover Photo">');
                                } else {
                                    $('.cover-photo').html('<img src="/images/default-cover.jpg" class="img-fluid" alt="Default Cover Photo">');
                                }
                                
                                // Update avatar
                                if (response.avatar) {
                                    $('.profile-photo img').attr('src', 'data:image/jpeg;base64,' + response.avatar);
                                } else {
                                    $('.profile-photo img').attr('src', '/images/avatar.jpg');
                                }

                                // Show success message
                                $('#messageBox').html('Profile updated successfully').addClass('alert-success').fadeIn();

                                // Hide message after 3 seconds
                                setTimeout(() => {
                                    $('#messageBox').fadeOut();
                                }, 3000);
                            });
                        },
                        error: function() {
                            Swal.fire({
                                title: "Error!",
                                text: "There was a problem updating your profile.",
                                icon: "error"
                            });
                        }
                    });
                }
            });
        });

        // Post submission
        const postForm = document.getElementById('postForm');
        const postsContainer = document.getElementById('postsContainer');
        if (postForm) {
            postForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(postForm);
                try {
                    const response = await fetch('/profile/post', {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        const newPost = await response.json();
                        prependNewPost(newPost);
                        postForm.reset();
                        Swal.fire({
                            title: 'Success!',
                            text: 'Your post has been submitted.',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });
                    } else {
                        const errorData = await response.json();
                        Swal.fire({
                            title: 'Error!',
                            text: errorData.error || 'Failed to submit post.',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    }
                } catch (err) {
                    console.error('Error submitting post:', err);
                    Swal.fire({
                        title: 'Error!',
                        text: 'An error occurred while submitting your post.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            });
        }

        function prependNewPost(post) {
            const postHTML = `
                <div class="profile-uoloaded-post border-bottom-1 pb-5">
                    ${post.image ? `<img src="data:image/jpeg;base64,${post.image}" alt="Post Image" class="img-fluid rounded">` : ''}
                    <a class="post-title" href="post-details.html">
                        <h3 class="text-black">${post.title}</h3>
                    </a>
                    <p>${post.content}</p>
                    <button class="btn btn-primary me-2"><span class="me-2"><i class="fa fa-heart"></i></span>Like</button>
                    <button class="btn btn-secondary" data-bs-toggle="modal" data-bs-target="#replyModal"><span class="me-2"><i class="fa fa-reply"></i></span>Reply</button>
                    <small>Posted on ${new Date(post.created_at).toLocaleString()}</small>
                </div>
            `;
            if (postsContainer) {
                postsContainer.insertAdjacentHTML('afterbegin', postHTML);
            } else {
                console.error('Posts container not found');
            }
        }

        // Highlight submission
        const highlightForm = document.getElementById('highlightForm');
        const highlightsContainer = document.getElementById('highlightsContainer');
        if (highlightForm) {
            highlightForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(highlightForm);
                try {
                    const response = await fetch(highlightForm.action, {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        const newHighlight = await response.json();
                        prependNewHighlight(newHighlight);
                        highlightForm.reset();
                        Swal.fire({
                            title: 'Success!',
                            text: 'Your highlight has been submitted.',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });
                    } else {
                        const errorData = await response.json();
                        Swal.fire({
                            title: 'Error!',
                            text: errorData.error || 'Failed to submit highlight.',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    }
                } catch (err) {
                    console.error('Error submitting highlight:', err);
                    Swal.fire({
                        title: 'Error!',
                        text: 'An error occurred while submitting your highlight.',
                        icon: 'error',
                        confirmButtonText: 'OK'
                    });
                }
            });
        }

        function prependNewHighlight(highlight) {
            const highlightHTML = `
                <div class="profile-blog mb-5">
                    <h4 class="text-primary d-inline">${highlight.title}</h4>
                    <a href="javascript:void()" class="pull-right f-s-16">More</a>
                    ${highlight.image ? `<img src="data:image/jpeg;base64,${highlight.image}" alt="" class="img-fluid mt-4 mb-4 rounded w-100" style="height: 10em; object-fit: fill;">` : ''}
                    <h4><a href="post-details.html" class="text-black">${highlight.title}</a></h4>
                    <p class="mb-0">${highlight.content}</p>
                </div>
            `;
            if (highlightsContainer) {
                highlightsContainer.insertAdjacentHTML('afterbegin', highlightHTML);
            } else {
                console.error('Highlights container not found');
            }
        }
    });
