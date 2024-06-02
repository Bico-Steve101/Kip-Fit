document.addEventListener('DOMContentLoaded', function () {
    let tagsInput = document.getElementById('tags');
    let tagButtons = document.querySelectorAll('.tag-btn');
    let selectedTags = new Set();

    tagButtons.forEach(button => {
        button.addEventListener('click', function () {
            let tag = this.getAttribute('data-tag');
            if (selectedTags.has(tag)) {
                selectedTags.delete(tag);
                this.classList.remove('btn-primary');
                this.classList.add('btn-outline-primary');
            } else {
                selectedTags.add(tag);
                this.classList.remove('btn-outline-primary');
                this.classList.add('btn-primary');
            }
            tagsInput.value = Array.from(selectedTags).join(',');
        });
    });
});