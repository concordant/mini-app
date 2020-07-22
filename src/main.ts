var x = 0;

var span = document.querySelector('span'); // find the <span> element in the DOM

function incrLabel() {
  if (span)
      // this function is executed whenever the user clicks the increment button
      span.textContent = (++x).toString()
}

function decrLabel() {
    if (span)
      // this function is executed whenever the user clicks the decrement button
      span.textContent = (--x).toString()
}
