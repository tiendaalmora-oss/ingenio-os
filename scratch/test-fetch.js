async function test() {
  const res = await fetch("https://os.ingeniodigital.shop/api/cron/drip-engine");
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
