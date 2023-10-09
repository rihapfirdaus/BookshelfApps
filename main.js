const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser Anda tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    const textCaption = document.getElementById('textCaptionFix');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (checkBox()) {
            addBookRead();
            alert('Selamat!\nBuku Anda berhasil ditambahkan ke rak sudah dibaca');
        } else {
            addBookUnread();
            alert('Selamat!\nBuku Anda berhasil ditambahkan ke rak belum dibaca');
        }
        clearForm();
    });
    if (isStorageExist()) {
        loadDataFromStorage();
    }
});

function checkBox() {
    const checkArea = document.getElementById('inputBookIsComplete');
    const text = document.getElementById('textCaption');

    if (checkArea.checked == true) {
        text.innerText = 'Selesai dibaca';
        return true;
    } else {
        text.innerText = 'Belum selesai dibaca';
        return false;
    }
}

function addBookUnread() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, false);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function addBookRead() {
    const bookTitle = document.getElementById('inputBookTitle').value;
    const bookAuthor = document.getElementById('inputBookAuthor').value;
    const bookYear = document.getElementById('inputBookYear').value;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, true);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function clearForm() {
    document.getElementById('inputBook').reset();
    document.getElementById('textCondition').innerText = 'Belum selesai dibaca';
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById('incompleteBookshelfList');
    incompleteBookList.innerHTML = '';

    const completeBookList = document.getElementById('completeBookshelfList');
    completeBookList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted) {
            incompleteBookList.append(bookElement);
        } else
            completeBookList.append(bookElement);
    }
});

function makeBook(bookObject) {
    const booksTitle = document.createElement('h3');
    booksTitle.innerText = bookObject.title;

    const booksAuthor = document.createElement('p');
    booksAuthor.innerText = 'Penulis: ' + bookObject.author;

    const booksYear = document.createElement('p');
    booksYear.innerText = 'Tahun terbit: ' + bookObject.year;

    const container = document.createElement('div');
    container.classList.add('action');

    const booksContainer = document.createElement('article');
    booksContainer.classList.add('book_item');
    booksContainer.append(booksTitle, booksAuthor, booksYear, container);
    booksContainer.setAttribute('id', `book-${bookObject.id}`);


    if (bookObject.isCompleted) {
        const uncompleteButton = document.createElement('button');
        uncompleteButton.classList.add('green');
        uncompleteButton.innerText = 'Belum selesai dibaca';

        uncompleteButton.addEventListener('click', function () {
            undoBookFromCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerText = 'Hapus';

        trashButton.addEventListener('click', function () {
            removeQuestion(bookObject.id);
        });

        container.append(uncompleteButton, trashButton);
    } else {
        const completeButton = document.createElement('button');
        completeButton.classList.add('green');
        completeButton.innerText = 'Selesai dibaca';

        completeButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerText = 'Hapus';

        trashButton.addEventListener('click', function () {
            removeQuestion(bookObject.id);
        });

        container.append(completeButton, trashButton);
    }
    return booksContainer;
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeQuestion(bookId) {
    if (confirm('Apakah Anda ingin menghapusnya?')) {
        removeBookFromList(bookId);
    } else {
        return;
    }
}

function removeBookFromList(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

searchBook.addEventListener('keyup', function (search) {
    const keywords = search.target.value.toLowerCase();
    const bookList = document.querySelectorAll('.book_item');

    bookList.forEach((item) => {
        const bookContent = item.firstChild.textContent.toLowerCase();
        if (bookContent.indexOf(keywords) != -1) {
            item.setAttribute('style', 'display: block;');
        } else {
            item.setAttribute('style', 'display: none !important;');
        }
    });
});