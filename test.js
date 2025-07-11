async function getProducts() {
  const numbers = [1, 2, 3, 4, 5];
  const products = await Promise.all(
    numbers.map(async (number, i) => {
      let response = await fetch(`https://fakestoreapi.com/products/${number}`);
      response = await response.json();
      return response;
    })
  );

  console.log(products);
}

getProducts();
