document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.fake-button').forEach(btn => {
        btn.addEventListener('click', () => {
            alert('⚠️⚠️⚠️ YOU HAVE NOT DOWNLOADED VIRUS ⚠️⚠️⚠️');
        });
    });
});