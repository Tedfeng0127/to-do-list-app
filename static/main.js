$(document).ready(function () {
    $(".note-container").click(function (e) {
        var targetClassName = e.target.className;
        var noteBox = e.target.parentElement.parentElement;
        
        if (targetClassName === "edit-note") {
            var originalNoteContent = e.target.parentElement.previousSibling.previousSibling.textContent;
            var noteBox = e.target.parentElement.parentElement;
            var editNoteBox = e.target.parentElement.parentElement.nextElementSibling;
            editNoteBox.children[0].children[0].setAttribute("value", originalNoteContent);
            noteBox.hidden = true;
            editNoteBox.hidden = false;
        }
        
        else if (targetClassName === "delete-note") {
            var deletedNoteDiv = e.target.parentElement.parentElement.parentElement;
            var deletedNoteId = deletedNoteDiv.children[0].children[1].textContent;
            var noteCount = $("div", ".note-container").length;
            $.ajax({
                url:"/delete_note",
                type:"get",
                contentType:"application/json",
                data:{"note_id":deletedNoteId},
                success:function () {
                    deletedNoteDiv.remove();
                    $(document).find("#note_count").text(noteCount - 1);
                }
            });
        }
        
        else if (targetClassName === "edit-note-cancel") {
            var noteBox = e.target.parentElement.parentElement.previousElementSibling;
            var editNoteBox = e.target.parentElement.parentElement;
            noteBox.hidden = false;
            editNoteBox.hidden = true;
        }
        
        else if (targetClassName === "edit-note-confirm") {
            var noteBox = e.target.parentElement.parentElement.previousElementSibling;
            var editNoteBox = e.target.parentElement.parentElement;
            var noteId = noteBox.children[1].textContent;
            var originalNoteContent = noteBox.children[3].textContent;
            var revisedNoteContent = editNoteBox.children[0].children[0].value.trim();
            if (originalNoteContent === revisedNoteContent) {
                noteBox.hidden = false;
                editNoteBox.hidden = true;
            } else {
                $.ajax({
                    url:"/edit_note",
                    type:"get",
                    contentType:"application/json",
                    data:{
                        "note_id":noteId,
                        "new_content":revisedNoteContent
                    },
                    success:function () {
                        noteBox.children[2].textContent = revisedNoteContent;
                        noteBox.hidden = false;
                        editNoteBox.hidden = true;
                    }
                });
            }
        }

        else if (targetClassName === "checkbox") {
            var noteBox = e.target.parentElement.parentElement.parentElement;
            var noteSpan = noteBox.children[0].children[2];
            var editButton = noteBox.children[0].children[4].children[0];
            var deleteButton = noteBox.children[0].children[3].children[0];
            if (noteSpan.getAttribute("style") === "text-decoration: none;") {
                noteSpan.setAttribute("style", "text-decoration: line-through;");
                editButton.disabled = true;
                deleteButton.disabled = true;
            }
            else if (noteSpan.getAttribute("style") === "text-decoration: line-through;") {
                noteSpan.setAttribute("style", "text-decoration: none;");
                editButton.disabled = false;
                deleteButton.disabled = false;
            }
        }
    })

    $(".add-note").click(function () {
        var noteCount = $("div", ".note-container").length;
        var input = $(this).prev();
        if (noteCount >= 10) {
            input.val("");
            alert("清單項目太多了，請刪除一些再新增！");
        }
        else {
            var newNoteContent = input.val().trim();
            input.val("");
            $.ajax({
                url:"/add_note",
                type:"post",
                contentType:"application/json",
                data:JSON.stringify({"new_note":newNoteContent}),
                success:function (response) {
                    var prepend_string = `
                    <div class="note">
                        <p id="note_box">
                            <span><input type="checkbox"></span>
                            <span id="note_id" hidden>${response.note_id}</span>
                            <span id="note_content">${newNoteContent}</span>
                            <span><button class="edit-note">修改</button></span>
                            <span><button class="delete-note">刪除</button></span>
                        </p>

                        <p id="edit_note_box" hidden>
                            <span><input type="text" id="edited_note_content" name="edited_note_content"></span>
                            <span><button class="edit-note-cancel">取消</button></span>
                            <span><button class="edit-note-confirm">確定</button></span>
                        </p>
                    </div>
                    `;
                    $(document).find(".note-container").prepend(prepend_string);
                    $(document).find("#note_count").text(noteCount + 1);
                }
            });
        }
    });
})